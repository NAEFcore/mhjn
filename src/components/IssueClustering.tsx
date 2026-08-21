import React from 'react';
import { Layers, Flame, ArrowUpRight } from 'lucide-react';
import { ISSUE_CLUSTERS } from '../data/mockNews';

interface IssueClusteringProps {
  onSelectKeyword: (kw: string) => void;
}

export const IssueClustering: React.FC<IssueClusteringProps> = ({ onSelectKeyword }) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-gray-900 text-base">
            이 시각 주요 이슈
          </h3>
        </div>
        <span className="text-[11px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
          심층 묶음뉴스
        </span>
      </div>

      <div className="space-y-3">
        {ISSUE_CLUSTERS.map((issue) => (
          <div
            key={issue.id}
            onClick={() => onSelectKeyword(issue.keyword)}
            className="p-3 bg-gray-50 hover:bg-indigo-50/70 border border-gray-100 rounded-lg cursor-pointer transition-all group"
          >
            <div className="flex items-center justify-between text-xs text-indigo-700 font-bold mb-1">
              <span>{issue.keyword}</span>
              <span className="text-[10px] text-gray-400 font-normal">{issue.timeAgo}</span>
            </div>
            <p className="text-xs font-semibold text-gray-800 group-hover:text-indigo-900 line-clamp-1 leading-snug">
              {issue.headline}
            </p>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2">
              <span>관련기사 {issue.articleCount}건</span>
              <span className="text-indigo-600 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                모아보기 <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
