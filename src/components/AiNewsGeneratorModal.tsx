import React, { useState } from 'react';
import { X, Sparkles, Send, Check, RefreshCw, PenTool } from 'lucide-react';
import { Article } from '../types';
import { REPORTERS } from '../data/mockNews';

interface AiNewsGeneratorModalProps {
  onClose: () => void;
  onPublishArticle: (newArticle: Article) => void;
}

export const AiNewsGeneratorModal: React.FC<AiNewsGeneratorModalProps> = ({
  onClose,
  onPublishArticle,
}) => {
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<'culture_art' | 'k_culture' | 'heritage' | 'opinion'>('culture_art');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedData, setGeneratedData] = useState<any | null>(null);

  const sampleTopics = [
    '조선 왕실 은입사 공예 기법의 현대 가구 접목',
    '국립발레단, 창작 판소리 발레 <심청의 눈물> 세계 초연',
    '유네스코 세계유산 안동 하회마을, 친환경 한옥 보존 프로젝트',
    '글로벌 K-웹툰의 문학성과 한국 설화 속 영웅 서사',
  ];

  const handleGenerate = async (targetTopic?: string) => {
    const query = targetTopic || topic;
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/generate-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: query,
          category: category === 'culture_art' ? '문화·예술' : category === 'k_culture' ? 'K-컬처' : '전통유산',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setGeneratedData(data);
      } else {
        throw new Error('API unavailable');
      }
    } catch (e) {
      // Local fallback generation
      setTimeout(() => {
        setGeneratedData({
          title: `[기획] "${query}"… 한국문화의 새로운 지평을 열다`,
          subtitle: '전통의 고유성과 현대적 감각의 만남, 국내외 문화계 비상한 관심 집중',
          summary: '한국문화저널 특별취재팀이 조명한 새로운 문화 예술 트렌드 리포트.',
          content: `대한민국 문화 예술계에 새로운 패러다임이 태동하고 있다. 최근 '${query}'을 둘러싼 다양한 담론과 창작 실험들이 국경을 넘어 전 세계 관객과 비평가들의 이목을 집중시키고 있다.

전통은 고정된 박제가 아니라 시대와 호흡하며 끊임없이 재해석될 때 진정한 생명력을 얻는다. 이번 프로젝트는 선조들의 지혜가 담긴 조형미와 철학적 깊이를 21세기 디지털 미디어와 결합해 대중과의 접점을 획기적으로 넓혔다는 평가를 받는다.

문화계 관계자는 "한국 고유의 서사와 미학적 질감이 현대인의 정서적 갈증을 채워주고 있다"며 "앞으로도 전통과 현대를 잇는 다채로운 시도가 이어질 것"이라고 강조했다.`,
          reporter: '정다은 문화전문기자',
          tags: ['한국문화', 'K-헤리티지', '문화기획', '예술비평'],
        });
        setIsLoading(false);
      }, 1000);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = () => {
    if (!generatedData) return;

    const newArticle: Article = {
      id: `ai-art-${Date.now()}`,
      category: category,
      categoryLabel: category === 'culture_art' ? '문화·예술' : category === 'k_culture' ? 'K-컬처·엔터' : '전통과 유산',
      title: generatedData.title,
      subtitle: generatedData.subtitle,
      summary: generatedData.summary || generatedData.subtitle,
      content: generatedData.content,
      reporter: REPORTERS.kim_yr,
      publishedAt: '2026.08.21. 방금 전',
      views: 120,
      shares: 10,
      likes: 15,
      reactions: {
        info: 8,
        exciting: 12,
        empathy: 14,
        analysis: 5,
        followup: 3,
      },
      imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=1200&q=80',
      imageCaption: '▲ 한국문화저널 AI 문화부 데스크 기획 취재 보도 사진.',
      tags: generatedData.tags || ['한국문화저널', 'AI속보', '문화예술'],
      badge: '기획',
      commentsCount: 0,
      aiSummary: [
        generatedData.subtitle || '한국 문화계의 새로운 패러다임과 창작 실험 조명',
        '전통의 깊이와 현대적 감각의 융합으로 국내외 호평',
      ],
    };

    onPublishArticle(newArticle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 font-serif-kr">
                한국문화저널 AI 문화속보 & 기획기사 생성기
              </h2>
              <p className="text-xs text-gray-500">
                Gemini AI를 활용해 원하는 문화 주제의 전문 보도기사를 즉시 작성합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {/* Category Select */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              기사 카테고리
            </label>
            <div className="flex items-center gap-2">
              {[
                { id: 'culture_art' as const, label: '문화·예술' },
                { id: 'k_culture' as const, label: 'K-컬처·엔터' },
                { id: 'heritage' as const, label: '전통과 유산' },
                { id: 'opinion' as const, label: '오피니언' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    category === c.id
                      ? 'bg-[#0051a8] text-white border-[#0051a8]'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              취재 주제 / 키워드
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="예: 조선 달항아리의 현대적 재해석, 국악과 재즈의 크로스오버..."
                className="flex-1 px-4 py-2.5 bg-gray-50 text-xs sm:text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-[#0051a8]"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isLoading || !topic.trim()}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs sm:text-sm font-bold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isLoading ? '작성중...' : '기사 생성'}</span>
              </button>
            </div>
          </div>

          {/* Suggested Topic Chips */}
          <div>
            <span className="text-xs font-semibold text-gray-500 block mb-1.5">
              추천 기획 아이템 클릭:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sampleTopics.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTopic(t);
                    handleGenerate(t);
                  }}
                  className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-blue-50 hover:text-[#0051a8] transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Generated Result Preview */}
          {generatedData && (
            <div className="mt-5 p-5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-xs">
                  생성 완료 (초안)
                </span>
                <span className="text-xs text-blue-700 font-semibold">
                  한국문화저널 표준 보도양식
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 font-serif-kr">
                {generatedData.title}
              </h3>
              {generatedData.subtitle && (
                <p className="text-xs text-gray-600 font-medium border-l-2 border-[#0051a8] pl-2">
                  {generatedData.subtitle}
                </p>
              )}
              <p className="text-xs text-gray-700 leading-relaxed max-h-40 overflow-y-auto">
                {generatedData.content}
              </p>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  onClick={() => handleGenerate()}
                  className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-50"
                >
                  다시 생성
                </button>
                <button
                  onClick={handlePublish}
                  className="px-4 py-1.5 bg-[#0051a8] text-white text-xs font-bold rounded-lg hover:bg-[#003870] shadow-xs flex items-center gap-1"
                >
                  <PenTool className="w-3.5 h-3.5" />
                  <span>신문에 발행하기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
