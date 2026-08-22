import React from 'react';
import { Layers, Flame, ArrowUpRight, BookOpen } from 'lucide-react';
import { ISSUE_CLUSTERS } from '../data/mockNews';

interface IssueClusteringProps {
  onSelectKeyword: (kw: string) => void;
  onSelectArticle?: (articleId: string) => void;
}

// Mapping issue cluster id to primary article id
const ISSUE_ARTICLE_MAP: Record<string, string> = {
  'iss-1': 'art-001',
  'iss-2': 'art-002',
  'iss-3': 'art-003',
  'iss-4': 'art-004',
};

export const IssueClustering: React.FC<IssueClusteringProps> = ({ onSelectKeyword, onSelectArticle }) => {
  const handleClickIssue = (issueId: string, keyword: string) => {
    const articleId = ISSUE_ARTICLE_MAP[issueId];
    if (onSelectArticle && articleId) {
      onSelectArticle(articleId);
    } else {
      onSelectKeyword(keyword);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs font-sans">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-base font-serif-kr">
            이 시각 주요 이슈
          </h3>
        </div>
        <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
          심층 묶음뉴스
        </span>
      </div>

      <div className="space-y-3">
        {ISSUE_CLUSTERS.map((issue) => {
          const targetArticleId = ISSUE_ARTICLE_MAP[issue.id] || 'art-001';
          return (
            <div
              key={issue.id}
              onClick={() => handleClickIssue(issue.id, issue.keyword)}
              className="p-3 bg-gray-50 hover:bg-indigo-50/80 border border-gray-100 rounded-lg cursor-pointer transition-all group hover:shadow-xs"
            >
              <div className="flex items-center justify-between text-xs text-indigo-700 font-bold mb-1">
                <span className="font-mono">{issue.keyword}</span>
                <span className="text-[10px] text-gray-400 font-normal">{issue.timeAgo}</span>
              </div>
              <p className="text-xs font-semibold text-gray-800 group-hover:text-indigo-950 line-clamp-2 leading-snug font-serif-kr">
                {issue.headline}
              </p>
              <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2.5 pt-2 border-t border-gray-100">
                <span className="text-[11px] text-gray-400">관련기사 {issue.articleCount}건</span>
                <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                  <BookOpen className="w-3 h-3" />
                  <span>본문 읽기</span>
                  <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
