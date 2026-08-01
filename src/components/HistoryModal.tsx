import React from 'react';
import { HistoryItem } from '../types';
import { History, X, Trash2, Calendar, FileText, ArrowRight, Sparkles } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelectHistory: (item: HistoryItem) => void;
  onClearHistory: () => void;
  onDeleteHistoryItem: (id: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectHistory,
  onClearHistory,
  onDeleteHistoryItem,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-gray-100 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl text-gray-800 overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-lg text-gray-900">최근 첨삭 기록</h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              총 {history.length}건
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-105 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <FileText className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="text-sm text-gray-500">저장된 첨삭 기록이 없습니다.</p>
              <p className="text-xs text-gray-450">
                자소서를 교정하면 자동으로 여기에 기록이 보관됩니다.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-gray-50 border border-gray-150/60 hover:border-indigo-300 hover:bg-indigo-50/15 rounded-xl p-4 transition group flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                onClick={() => onSelectHistory(item)}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                      {item.request.jobTitle}
                    </span>
                    {item.request.companyName && (
                      <span className="text-xs text-gray-500 font-medium">
                        {item.request.companyName}
                      </span>
                    )}
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 ml-auto sm:ml-2">
                      <Calendar className="w-3 h-3" />
                      {new Date(item.createdAt).toLocaleDateString('ko-KR')}
                    </span>
                  </div>

                  <h4 className="font-semibold text-sm text-gray-800 group-hover:text-indigo-600 transition line-clamp-1">
                    &quot;{item.result.headline}&quot;
                  </h4>

                  <p className="text-xs text-gray-500 line-clamp-1">
                    {item.request.content}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSelectHistory(item)}
                    className="inline-flex items-center space-x-1 text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition cursor-pointer"
                  >
                    <span>열람하기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteHistoryItem(item.id)}
                    className="p-1.5 rounded-lg bg-white border border-gray-200 hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition cursor-pointer"
                    title="기록 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
            <button
              onClick={onClearHistory}
              className="text-xs text-rose-650 hover:text-rose-700 font-medium flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>전체 기록 삭제</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-xs text-gray-700 font-semibold cursor-pointer"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
