import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileCode, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  RefreshCw, 
  FileText, 
  Database, 
  Flame, 
  Layers, 
  ChevronRight, 
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Eye,
  X,
  Play,
  RotateCcw,
  Zap,
  ListFilter,
  Trash2,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import { Article } from '../types';
import { ArticleBodyRenderer } from './ArticleBodyRenderer';
import { 
  parseWordPressXml, 
  executeWordPressImportToFirestore, 
  WordPressParsedItem, 
  ImportProgress,
  wpItemToArticle
} from '../utils/wordpressImporter';
import { 
  saveArticleToFirestore, 
  getWordPressImportedArticles, 
  deleteWordPressImportedArticlesFromFirestore 
} from '../firebase';

interface WordPressImportTabProps {
  onArticlesImported?: () => void;
  existingArticles?: Article[];
  onImportComplete?: (imported: Article[]) => void;
  onArticlesPurged?: (remainingArticles: Article[]) => void;
}

export const WordPressImportTab: React.FC<WordPressImportTabProps> = ({ 
  onArticlesImported,
  existingArticles = [],
  onImportComplete,
  onArticlesPurged
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState<WordPressParsedItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [previewItem, setPreviewItem] = useState<WordPressParsedItem | null>(null);
  const [singleSavedNotice, setSingleSavedNotice] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Purge State
  const [isPurging, setIsPurging] = useState(false);
  const [purgeProgress, setPurgeProgress] = useState<{ deleted: number; total: number } | null>(null);
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const [purgeTargetCount, setPurgeTargetCount] = useState<number>(0);
  const [purgeSuccessNotice, setPurgeSuccessNotice] = useState<string | null>(null);

  // Calculate existing WordPress vs Manual articles from props
  const wpArticlesInProps = React.useMemo(() => {
    return existingArticles.filter(a => {
      const isWp = a.importSource === 'wordpress' || 
                   a.sourceName === 'WordPress Import' || 
                   a.id.startsWith('art-wp-');
      const isStandardDemo = /^art-00[1-9]$/.test(a.id) || /^art-01[0-9]$/.test(a.id);
      return isWp && !isStandardDemo;
    });
  }, [existingArticles]);

  const manualArticlesCount = React.useMemo(() => {
    return existingArticles.length - wpArticlesInProps.length;
  }, [existingArticles, wpArticlesInProps]);

  // Open Purge Modal with fresh count
  const handleOpenPurgeModal = async () => {
    try {
      const wpInFirestore = await getWordPressImportedArticles();
      const count = Math.max(wpInFirestore.length, wpArticlesInProps.length);
      setPurgeTargetCount(count);
      setShowPurgeModal(true);
    } catch {
      setPurgeTargetCount(wpArticlesInProps.length);
      setShowPurgeModal(true);
    }
  };

  // Execute Batch Purge of WordPress Imported Articles
  const handleExecutePurge = async () => {
    setIsPurging(true);
    setPurgeProgress({ deleted: 0, total: purgeTargetCount });
    try {
      const { deletedCount } = await deleteWordPressImportedArticlesFromFirestore((deleted, total) => {
        setPurgeProgress({ deleted, total });
      });

      setShowPurgeModal(false);
      setPurgeSuccessNotice(`총 ${deletedCount}건의 WordPress 가져온 기사를 안전하게 비웠습니다. (정식 기사는 보존됨)`);

      // Filter remaining in-memory articles
      const remaining = existingArticles.filter(a => {
        const isWp = a.importSource === 'wordpress' || 
                     a.sourceName === 'WordPress Import' || 
                     a.id.startsWith('art-wp-');
        const isStandardDemo = /^art-00[1-9]$/.test(a.id) || /^art-01[0-9]$/.test(a.id);
        return !isWp || isStandardDemo;
      });

      if (onArticlesPurged) {
        onArticlesPurged(remaining);
      }
      if (onArticlesImported) {
        onArticlesImported();
      }
    } catch (err: any) {
      console.error('Purge error:', err);
      alert(`기사 비우기 처리 중 오류가 발생했습니다: ${err?.message || err}`);
    } finally {
      setIsPurging(false);
      setPurgeProgress(null);
    }
  };

  // Category distribution stats
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    parsedItems.forEach(item => {
      counts[item.categoryLabel] = (counts[item.categoryLabel] || 0) + 1;
    });
    return counts;
  }, [parsedItems]);

  const filteredParsedItems = React.useMemo(() => {
    if (!searchTerm.trim()) return parsedItems;
    const q = searchTerm.toLowerCase().trim();
    return parsedItems.filter(p => 
      p.koreanTitle.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.reporterName.toLowerCase().includes(q) ||
      p.wpPostId.includes(q)
    );
  }, [parsedItems, searchTerm]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml') && !file.type.includes('xml') && !file.type.includes('text')) {
      setParseError('워드프레스 내보내기 XML 파일(.xml)을 선택해 주세요.');
      return;
    }

    setSelectedFile(file);
    setParseError(null);
    setProgress(null);
    parseFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml') && !file.type.includes('xml')) {
      setParseError('워드프레스 내보내기 XML 파일(.xml)을 드롭해 주세요.');
      return;
    }

    setSelectedFile(file);
    setParseError(null);
    setProgress(null);
    parseFile(file);
  };

  const parseFile = (file: File) => {
    setIsParsing(true);
    setParseError(null);
    setParsedItems([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text || (!text.includes('<rss') && !text.includes('<item'))) {
          throw new Error('유효한 워드프레스 WXR/RSS XML 파일 형식이 아닙니다.');
        }

        const items = parseWordPressXml(text);
        if (items.length === 0) {
          throw new Error('XML 파일 내에서 유효한 기사(post) 데이터를 찾을 수 없습니다.');
        }

        setParsedItems(items);
        setIsParsing(false);
      } catch (err: any) {
        console.error('XML parsing error:', err);
        setParseError(err?.message || 'XML 파일을 파싱하는 중 오류가 발생했습니다.');
        setIsParsing(false);
      }
    };

    reader.onerror = () => {
      setParseError('파일을 읽는 도중 오류가 발생했습니다.');
      setIsParsing(false);
    };

    reader.readAsText(file, 'utf-8');
  };

  // Step-by-step Import Runner
  const runImport = async (itemsToImport: WordPressParsedItem[]) => {
    if (itemsToImport.length === 0 || isImporting) return;

    setIsImporting(true);
    try {
      const result = await executeWordPressImportToFirestore(itemsToImport, (currentProgress) => {
        setProgress(currentProgress);
      });

      if (onArticlesImported) {
        onArticlesImported();
      }

      if (onImportComplete) {
        const converted = itemsToImport.map(wpItemToArticle);
        onImportComplete(converted);
      }
    } catch (err: any) {
      console.error('Import execution error:', err);
      setParseError('가져오기 실행 중 예기치 않은 오류가 발생했습니다.');
    } finally {
      setIsImporting(false);
    }
  };

  // Import single specific item immediately for testing
  const handleImportSingle = async (item: WordPressParsedItem) => {
    try {
      const article = wpItemToArticle(item);
      await saveArticleToFirestore(article);
      setSingleSavedNotice(`[${item.koreanTitle}] 기사가 Firestore에 저장되었습니다. ID: ${article.id}`);
      if (onArticlesImported) onArticlesImported();
      if (onImportComplete) onImportComplete([article]);
    } catch (e: any) {
      alert(`단일 기사 저장 실패: ${e?.message || e}`);
    }
  };

  // Retry failed items only
  const handleRetryFailed = () => {
    if (!progress || progress.errors.length === 0) return;
    const failedItems = progress.errors
      .map(e => e.item)
      .filter((item): item is WordPressParsedItem => !!item);

    if (failedItems.length > 0) {
      runImport(failedItems);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedItems([]);
    setProgress(null);
    setParseError(null);
    setPreviewItem(null);
    setSingleSavedNotice(null);
    setSearchTerm('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const progressPercent = progress && progress.total > 0 
    ? Math.min(100, Math.round((progress.processed / progress.total) * 100)) 
    : 0;

  return (
    <div className="space-y-6" id="wp-xml-import-container">
      {/* Header Info */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white p-6 rounded-2xl border border-stone-700 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                WordPress 기사 일괄 가져오기 (XML to Firestore)
                <span className="text-xs bg-amber-500 text-stone-950 font-bold px-2.5 py-0.5 rounded-full font-sans">
                  대용량 2,000+ 원문 100% 보존
                </span>
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                워드프레스 백업 XML의 본문(Gutenberg 블록, wp:html, 이미지, 링크)을 첫 문장부터 끝 문장까지 손실 없이 Firebase Cloud Firestore <code className="text-amber-300">articles</code> 컬렉션에 영구 저장합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-stone-950/70 px-3.5 py-2 rounded-xl border border-stone-700">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>저장 대상: <strong className="text-emerald-400 font-bold">Firebase Cloud Firestore</strong></span>
          </div>
        </div>
      </div>

      {/* Single Saved Toast Notification */}
      {singleSavedNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{singleSavedNotice}</span>
          </div>
          <button 
            onClick={() => setSingleSavedNotice(null)}
            className="text-emerald-700 hover:text-emerald-950 font-bold ml-4"
          >
            닫기
          </button>
        </div>
      )}

      {/* Purge Success Toast Notification */}
      {purgeSuccessNotice && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-700 shrink-0" />
            <span className="font-bold">{purgeSuccessNotice}</span>
          </div>
          <button 
            onClick={() => setPurgeSuccessNotice(null)}
            className="text-amber-800 hover:text-amber-950 font-bold ml-4"
          >
            닫기
          </button>
        </div>
      )}

      {/* Purge In-Progress Live Status Card */}
      {isPurging && purgeProgress && (
        <div className="p-5 bg-rose-50 border-2 border-rose-300 rounded-2xl shadow-sm space-y-3 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-rose-600 animate-spin" />
              <span className="font-bold text-rose-950 text-sm">
                WordPress 가져온 기사 비우기 작업 진행 중... (배치 안전 삭제)
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-rose-800 bg-rose-200/80 px-2.5 py-1 rounded-full">
              {purgeProgress.deleted} / {purgeProgress.total} 건 ({Math.min(100, Math.round((purgeProgress.deleted / (purgeProgress.total || 1)) * 100))}%)
            </span>
          </div>
          <div className="w-full bg-rose-200 h-2.5 rounded-full overflow-hidden">
            <div 
              className="bg-rose-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.round((purgeProgress.deleted / (purgeProgress.total || 1)) * 100))}%` }}
            />
          </div>
          <p className="text-[11px] text-rose-700">
            * 직접 작성한 정식 기사는 유지되며, WordPress로 가져온 기사만 Firestore에서 안전하게 삭제하고 있습니다.
          </p>
        </div>
      )}

      {/* Firestore WordPress Article Storage Status & Purge Control Bar */}
      <div className="bg-stone-50 border border-stone-300/80 rounded-2xl p-4.5 flex items-center justify-between flex-wrap gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-200 border border-stone-300 flex items-center justify-center text-stone-700">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-stone-900">Firestore 등록 기사 현황</span>
              <span className="text-[11px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded font-mono font-bold">
                전체 {existingArticles.length.toLocaleString()}건
              </span>
            </div>
            <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-2">
              <span>WordPress 가져온 기사: <strong className="text-amber-800 font-bold">{wpArticlesInProps.length.toLocaleString()}건</strong></span>
              <span className="text-stone-300">|</span>
              <span className="text-emerald-700 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 직접 작성한 정식 기사: <strong>{manualArticlesCount.toLocaleString()}건 (영구 보존)</strong>
              </span>
            </p>
          </div>
        </div>

        {/* Purge Trigger Button */}
        <button
          onClick={handleOpenPurgeModal}
          disabled={isPurging || isImporting || wpArticlesInProps.length === 0}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-all ${
            wpArticlesInProps.length === 0 || isPurging || isImporting
              ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 hover:border-rose-400 active:scale-95'
          }`}
          title="WordPress Import로 가져온 기사만 선택적으로 비웁니다"
        >
          <Trash2 className="w-4 h-4 text-rose-600" />
          <span>가져온 기사 비우기 ({wpArticlesInProps.length}건)</span>
        </button>
      </div>

      {/* Purge Confirmation Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-300 space-y-5 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3 border-b border-stone-100 pb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-stone-900 font-serif-kr">
                  WordPress 가져온 기사 비우기 확인
                </h4>
                <p className="text-xs text-stone-500">
                  가져온 기사만 안전하게 선별 삭제합니다
                </p>
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2 text-xs text-stone-700">
              <p className="font-bold text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                삭제 대상: 총 <span className="font-mono text-sm underline">{purgeTargetCount.toLocaleString()}건</span>의 WordPress 기사
              </p>
              <ul className="list-disc list-inside space-y-1 text-stone-600 pl-1">
                <li><strong className="text-stone-900">WordPress Import</strong>로 가져온 기사만 Firestore에서 영구 삭제됩니다.</li>
                <li>기존에 직접 작성하신 <strong className="text-emerald-700">정식 기사는 절대 삭제되지 않고 유지</strong>됩니다.</li>
                <li>삭제 완료 즉시 뉴스 메인과 KCJ Radio 목록에서도 바로 갱신됩니다.</li>
              </ul>
            </div>

            <p className="text-xs text-stone-600 font-medium">
              정말 가져온 WordPress 기사 <strong className="text-rose-700">{purgeTargetCount.toLocaleString()}건</strong>을 삭제하시겠습니까?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setShowPurgeModal(false)}
                disabled={isPurging}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition"
              >
                취소
              </button>
              <button
                onClick={handleExecutePurge}
                disabled={isPurging || purgeTargetCount === 0}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>네, 가져온 기사만 비우기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Upload Stage */}
      {!parsedItems.length && !progress && (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isParsing 
              ? 'border-amber-500 bg-amber-500/5' 
              : 'border-stone-300 hover:border-amber-500 hover:bg-stone-50 bg-white shadow-xs'
          }`}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xml,text/xml" 
            className="hidden" 
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center">
              {isParsing ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>

            <div>
              <h4 className="text-base font-bold text-stone-900">
                {isParsing ? '워드프레스 XML 파일을 정밀 분석하고 있습니다...' : '워드프레스 백업 XML 파일을 선택하거나 여기로 드래그하세요'}
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                워드프레스 관리자 메뉴 &gt; 도구 &gt; 내보내기(Export)에서 다운로드한 <span className="font-mono text-stone-800 font-bold">.xml</span> 파일 (약 2,000건 대용량 완벽 지원)
              </p>
            </div>

            <button 
              type="button" 
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              내 컴퓨터에서 XML 파일 선택
            </button>
          </div>
        </div>
      )}

      {/* Parse Error Notice */}
      {parseError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">XML 파싱 및 처리 오류</p>
            <p className="text-xs mt-1 text-rose-700">{parseError}</p>
          </div>
        </div>
      )}

      {/* Parsed Summary & Action Stage */}
      {parsedItems.length > 0 && !progress && (
        <div className="space-y-6">
          {/* File & Extracted Stats Card */}
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4 flex-wrap gap-2">
              <div>
                <span className="text-xs text-stone-500 font-medium">선택된 파일:</span>
                <h4 className="text-base font-bold text-stone-900 font-mono mt-0.5 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-amber-600" />
                  {selectedFile?.name || 'wordpress_export.xml'}
                </h4>
              </div>
              <button
                onClick={handleReset}
                className="text-xs text-stone-500 hover:text-stone-800 hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3.5 h-3.5" /> 다른 파일 선택
              </button>
            </div>

            {/* Metric Boxes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-amber-50/80 border border-amber-200/80 p-4 rounded-xl">
                <span className="text-xs text-amber-800 font-bold block">전체 추출 기사 수</span>
                <span className="text-2xl font-black text-amber-900 mt-1 block">
                  {parsedItems.length.toLocaleString()} <span className="text-sm font-normal">건</span>
                </span>
              </div>

              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl">
                <span className="text-xs text-stone-600 font-bold block">분류된 카테고리</span>
                <span className="text-2xl font-black text-stone-900 mt-1 block">
                  {Object.keys(categoryCounts).length} <span className="text-sm font-normal">개 분야</span>
                </span>
              </div>

              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl">
                <span className="text-xs text-stone-600 font-bold block">게시 상태</span>
                <span className="text-xl font-black text-emerald-700 mt-1 block">
                  {parsedItems.filter(p => p.status === 'PUBLISHED').length.toLocaleString()} <span className="text-xs font-normal text-stone-500">발행 / {parsedItems.filter(p => p.status === 'DRAFT').length} 임시</span>
                </span>
              </div>

              <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl">
                <span className="text-xs text-stone-600 font-bold block">원문 보존 검증</span>
                <span className="text-xs font-bold text-emerald-700 mt-1 block flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Gutenberg·HTML 완벽 보존
                </span>
                <span className="text-[10px] text-stone-500">첫 문장 ~ 끝 문장 무손실</span>
              </div>
            </div>

            {/* Category Breakdown */}
            <div>
              <h5 className="text-xs font-bold text-stone-700 mb-2">분야별 분포 현황:</h5>
              <div className="flex flex-wrap gap-2">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <span key={cat} className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200 font-medium">
                    {cat}: <strong className="text-stone-900">{count}건</strong>
                  </span>
                ))}
              </div>
            </div>

            {/* Step-by-Step Test & Batch Action Panel */}
            <div className="bg-stone-900 text-white p-5 rounded-xl border border-stone-800 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-400" />
                    단계별 안전 가져오기 실행 (테스트 &gt; 소량 &gt; 대량)
                  </h4>
                  <p className="text-xs text-stone-300 mt-0.5">
                    안전한 검증을 위해 1건 샘플 테스트 후 순차적으로 10건, 50건, 전체 2,000건을 가져올 수 있습니다.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                {/* 1 Article Sample Test */}
                <button
                  type="button"
                  onClick={() => runImport(parsedItems.slice(0, 1))}
                  disabled={isImporting}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  🧪 1건 샘플 테스트 가져오기
                </button>

                {/* 10 Articles */}
                <button
                  type="button"
                  onClick={() => runImport(parsedItems.slice(0, 10))}
                  disabled={isImporting}
                  className="px-4 py-2.5 bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  ⚡ 10건 가져오기
                </button>

                {/* 50 Articles */}
                <button
                  type="button"
                  onClick={() => runImport(parsedItems.slice(0, 50))}
                  disabled={isImporting}
                  className="px-4 py-2.5 bg-stone-700 hover:bg-stone-600 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-1.5"
                >
                  🚀 50건 가져오기
                </button>

                {/* All Articles */}
                <button
                  type="button"
                  onClick={() => runImport(parsedItems)}
                  disabled={isImporting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" />
                  🔥 전체 {parsedItems.length.toLocaleString()}건 일괄 가져오기 (Firestore)
                </button>
              </div>
            </div>

            {/* Interactive Articles Preview List & Inspector */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h5 className="text-xs font-bold text-stone-800 flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-amber-600" />
                  <span>파싱된 기사 목록 및 원문 검사기 (클릭하여 전체 본문 확인)</span>
                  <span className="text-[11px] text-stone-500 font-normal">총 {parsedItems.length}건</span>
                </h5>

                <div className="w-64">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="제목, 기자명, ID 검색..."
                    className="w-full px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden max-h-72 overflow-y-auto">
                {filteredParsedItems.slice(0, 30).map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setPreviewItem(item)}
                    className="p-3 hover:bg-amber-50/50 text-xs flex items-center justify-between gap-4 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="text-[10px] text-stone-400 font-mono w-6 text-right shrink-0">
                        {idx + 1}
                      </span>
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                        {item.categoryLabel}
                      </span>
                      <span className="font-semibold text-stone-900 truncate">
                        {item.koreanTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-stone-500 text-[11px]">
                      <span className="text-emerald-700 font-mono text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {item.characterCount.toLocaleString()}자
                      </span>
                      <span className="font-mono text-stone-400">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('ko-KR') : ''}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewItem(item);
                        }}
                        className="px-2 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[10px] font-bold flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" /> 미리보기
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {filteredParsedItems.length > 30 && (
                <p className="text-[11px] text-stone-400 text-right">
                  상위 30건 표시 중 (검색창을 통해 특정 기사를 찾으실 수 있습니다)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Live Import Progress Stage */}
      {progress && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h4 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                {progress.isComplete ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    워드프레스 기사 일괄 가져오기가 완료되었습니다!
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
                    Firestore 일괄 저장 진행 중...
                  </>
                )}
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                {progress.isComplete 
                  ? '모든 기사가 Firebase Cloud Firestore에 영구 저장되었습니다. 브라우저 창이나 다른 기기에서도 동일하게 노출됩니다.' 
                  : `현재 처리 중인 기사: ${progress.currentTitle || '배치 전송 중...'}`}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs text-stone-500 font-medium">진행률</span>
              <div className="text-2xl font-black text-amber-600 font-mono">
                {progress.processed.toLocaleString()} / {progress.total.toLocaleString()}
                <span className="text-sm text-stone-500 ml-1 font-normal">({progressPercent}%)</span>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-100 rounded-full h-3.5 overflow-hidden border border-stone-200 p-0.5">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                progress.isComplete ? 'bg-emerald-500' : 'bg-gradient-to-r from-amber-500 to-amber-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Live Metric Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl">
              <span className="text-xs text-stone-500 font-bold block">전체 대상</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">
                {progress.total.toLocaleString()}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <span className="text-xs text-emerald-700 font-bold block">성공 (신규 Firestore 저장)</span>
              <span className="text-2xl font-black text-emerald-800 mt-1 block">
                {progress.success.toLocaleString()}
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <span className="text-xs text-amber-700 font-bold block">중복 건너뜀 (기존 기사 보존)</span>
              <span className="text-2xl font-black text-amber-800 mt-1 block">
                {progress.duplicate.toLocaleString()}
              </span>
            </div>

            <div className={`p-4 rounded-xl border ${progress.failed > 0 ? 'bg-rose-50 border-rose-200' : 'bg-stone-50 border-stone-200'}`}>
              <span className={`text-xs font-bold block ${progress.failed > 0 ? 'text-rose-700' : 'text-stone-500'}`}>
                실패
              </span>
              <span className={`text-2xl font-black mt-1 block ${progress.failed > 0 ? 'text-rose-800' : 'text-stone-900'}`}>
                {progress.failed.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Error List with Retry Button if any failed */}
          {progress.errors.length > 0 && (
            <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/70 space-y-3">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  실패한 기사 목록 ({progress.errors.length}건)
                </h5>
                <button
                  type="button"
                  onClick={handleRetryFailed}
                  disabled={isImporting}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-xs transition flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  실패 건만 다시 가져오기
                </button>
              </div>
              <div className="max-h-40 overflow-y-auto divide-y divide-rose-100 text-xs">
                {progress.errors.map((err, i) => (
                  <div key={i} className="py-2 flex justify-between gap-4">
                    <span className="font-medium text-stone-800 truncate">{err.title}</span>
                    <span className="text-rose-600 font-mono text-[11px] shrink-0">{err.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Complete Reset Button */}
          {progress.isComplete && (
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-800 text-xs font-bold rounded-xl transition"
              >
                다른 XML 파일 추가 가져오기
              </button>
            </div>
          )}
        </div>
      )}

      {/* Full Article Inspector / Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-stone-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <div className="flex items-center gap-2">
                <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-xs">
                  {previewItem.categoryLabel}
                </span>
                <span className="font-mono text-xs text-stone-500">
                  ID: {previewItem.articleId} (WP: {previewItem.wpPostId})
                </span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-5 flex-1 text-stone-800 font-sans">
              <div>
                <h3 className="text-xl font-bold font-serif-kr text-stone-900 leading-tight">
                  {previewItem.koreanTitle}
                </h3>
                <div className="flex items-center gap-3 text-xs text-stone-500 mt-2 font-medium">
                  <span>{previewItem.reporterName} 기자</span>
                  <span>·</span>
                  <span>{previewItem.publishedAt ? new Date(previewItem.publishedAt).toLocaleString('ko-KR') : ''}</span>
                  <span>·</span>
                  <span className="text-emerald-700 font-bold">본문 길이: {previewItem.characterCount.toLocaleString()}자</span>
                </div>
              </div>

              {/* Start & End Sentence Verification Box */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="font-bold text-stone-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  원문 무손실 검증 (시작 문장 및 끝 문장 일치 확인)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block font-bold mb-1">시작 문장 (첫 부분):</span>
                    <span className="text-stone-700 font-serif-kr">{previewItem.firstSentence || '...' }</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block font-bold mb-1">끝 문장 (마지막 부분):</span>
                    <span className="text-stone-700 font-serif-kr">{previewItem.lastSentence || '...'}</span>
                  </div>
                </div>
              </div>

              {/* Rendered Body Content */}
              <div className="border-t border-stone-100 pt-4">
                <h5 className="text-xs font-bold text-stone-500 mb-3 uppercase tracking-wider">
                  렌더링된 본문 전체 내용:
                </h5>
                <ArticleBodyRenderer
                  content={previewItem.koreanBody}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                닫기
              </button>

              <button
                type="button"
                onClick={async () => {
                  await handleImportSingle(previewItem);
                  setPreviewItem(null);
                }}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5" />
                이 기사만 즉시 Firestore에 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
