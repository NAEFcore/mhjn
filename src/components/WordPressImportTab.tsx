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
  ExternalLink
} from 'lucide-react';
import { Article } from '../types';
import { 
  parseWordPressXml, 
  executeWordPressImportToFirestore, 
  WordPressParsedItem, 
  ImportProgress 
} from '../utils/wordpressImporter';

interface WordPressImportTabProps {
  onArticlesImported?: () => void;
}

export const WordPressImportTab: React.FC<WordPressImportTabProps> = ({ onArticlesImported }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parsedItems, setParsedItems] = useState<WordPressParsedItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category distribution stats
  const categoryCounts = React.useMemo(() => {
    const counts: Record<string, number> = {};
    parsedItems.forEach(item => {
      counts[item.categoryLabel] = (counts[item.categoryLabel] || 0) + 1;
    });
    return counts;
  }, [parsedItems]);

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
        if (!text || !text.includes('<rss') && !text.includes('<item')) {
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

  const handleStartImport = async () => {
    if (parsedItems.length === 0 || isImporting) return;

    setIsImporting(true);
    try {
      await executeWordPressImportToFirestore(parsedItems, (currentProgress) => {
        setProgress(currentProgress);
      });

      if (onArticlesImported) {
        onArticlesImported();
      }
    } catch (err: any) {
      console.error('Import execution error:', err);
      setParseError('가져오기 실행 중 예기치 않은 오류가 발생했습니다.');
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedItems([]);
    setProgress(null);
    setParseError(null);
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
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white p-6 rounded-xl border border-stone-700 shadow-md">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold font-serif flex items-center gap-2">
                WordPress 기사 일괄 가져오기 (XML to Firestore)
                <span className="text-xs bg-amber-500 text-stone-950 font-bold px-2 py-0.5 rounded-full font-sans">
                  대용량 2,000+ 지원
                </span>
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                기존 워드프레스 백업 XML 파일의 전체 기사를 브라우저에서 파싱하여 Firebase Cloud Firestore <code className="text-amber-300">articles</code> 컬렉션으로 영구 저장합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs bg-stone-950/60 px-3 py-2 rounded-lg border border-stone-700">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>대상 저장소: <strong className="text-emerald-400">Firebase Cloud Firestore</strong></span>
          </div>
        </div>
      </div>

      {/* File Upload Stage */}
      {!parsedItems.length && !progress && (
        <div 
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            isParsing 
              ? 'border-amber-500 bg-amber-500/5' 
              : 'border-stone-300 hover:border-amber-500 hover:bg-stone-50 bg-white'
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
                {isParsing ? '워드프레스 XML 파일을 분석하고 있습니다...' : '워드프레스 백업 XML 파일을 선택하거나 여기로 드래그하세요'}
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                워드프레스 관리자 메뉴 &gt; 도구 &gt; 내보내기(Export)에서 다운로드한 <span className="font-mono text-stone-800 font-bold">.xml</span> 파일
              </p>
            </div>

            <button 
              type="button" 
              className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-sm transition"
            >
              내 컴퓨터에서 XML 파일 선택
            </button>
          </div>
        </div>
      )}

      {/* Parse Error Notice */}
      {parseError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">XML 파싱 및 처리 오류</p>
            <p className="text-xs mt-1 text-rose-700">{parseError}</p>
          </div>
        </div>
      )}

      {/* Parsed Summary & Ready to Import Stage */}
      {parsedItems.length > 0 && !progress && (
        <div className="space-y-6">
          {/* File & Extracted Stats Card */}
          <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
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
                className="text-xs text-stone-500 hover:text-stone-800 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> 다른 파일 선택
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
                <span className="text-xs text-stone-600 font-bold block">전송 방식</span>
                <span className="text-sm font-bold text-stone-800 mt-1 block">
                  안전한 Batch Chunk (80건씩 분할 전송)
                </span>
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

            {/* Sample Articles Preview List */}
            <div>
              <h5 className="text-xs font-bold text-stone-700 mb-2 flex items-center justify-between">
                <span>미리보기 (상위 5건)</span>
                <span className="text-[11px] text-stone-400 font-normal">전체 {parsedItems.length}건 중 일부</span>
              </h5>
              <div className="border border-stone-200 rounded-lg divide-y divide-stone-100 overflow-hidden max-h-56 overflow-y-auto">
                {parsedItems.slice(0, 5).map((item, idx) => (
                  <div key={idx} className="p-3 hover:bg-stone-50 text-xs flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0">
                        {item.categoryLabel}
                      </span>
                      <span className="font-medium text-stone-900 truncate">
                        {item.koreanTitle}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 shrink-0 font-mono">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString('ko-KR') : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Trigger Card */}
          <div className="p-6 bg-stone-900 text-white rounded-xl flex items-center justify-between flex-wrap gap-4">
            <div>
              <h4 className="text-base font-bold flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                Firebase Cloud Firestore로 가져오기를 시작할 준비가 되었습니다.
              </h4>
              <p className="text-xs text-stone-300 mt-1">
                기존 기사와 중복(ID 또는 제목 일치)되는 항목은 자동으로 건너뛰며, 새 기사만 안전하게 배치 저장됩니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleStartImport}
              disabled={isImporting}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {parsedItems.length.toLocaleString()}건 Firestore 저장 시작
            </button>
          </div>
        </div>
      )}

      {/* Live Import Progress Stage */}
      {progress && (
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-6">
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
              <span className="text-xs text-stone-500 font-bold block">전체</span>
              <span className="text-2xl font-black text-stone-900 mt-1 block">
                {progress.total.toLocaleString()}
              </span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
              <span className="text-xs text-emerald-700 font-bold block">성공 (신규 저장)</span>
              <span className="text-2xl font-black text-emerald-800 mt-1 block">
                {progress.success.toLocaleString()}
              </span>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl">
              <span className="text-xs text-amber-700 font-bold block">중복 (기존 기사 보존)</span>
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

          {/* Error List if any */}
          {progress.errors.length > 0 && (
            <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/50 space-y-2">
              <h5 className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                실패한 기사 목록 ({progress.errors.length}건)
              </h5>
              <div className="max-h-40 overflow-y-auto divide-y divide-rose-100 text-xs">
                {progress.errors.map((err, i) => (
                  <div key={i} className="py-1.5 flex justify-between gap-4">
                    <span className="font-medium text-stone-800 truncate">{err.title}</span>
                    <span className="text-rose-600 shrink-0">{err.error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reset / Complete Buttons */}
          {progress.isComplete && (
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-lg transition"
              >
                다른 XML 파일 추가 가져오기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
