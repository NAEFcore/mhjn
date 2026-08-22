import React, { useState } from 'react';
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  X, 
  HelpCircle, 
  FileSpreadsheet, 
  Terminal, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface WpXmlConverterModalProps {
  onClose: () => void;
}

export const WpXmlConverterModal: React.FC<WpXmlConverterModalProps> = ({ onClose }) => {
  const [copied, setCopied] = useState(false);

  const pythonCode = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한국문화저널 (Korea Culture Journal) - 워드프레스 XML to 구글시트 CSV 변환기
대용량(2,000개 이상) WXR XML 파일을 메모리 부담 없이 구글 스프레드시트용 CSV로 초고속 변환합니다.
"""

import sys
import os
import csv
import re
import xml.etree.ElementTree as ET
from html import unescape

def clean_html(raw_html):
    if not raw_html:
        return ""
    text = unescape(raw_html)
    text = text.replace('<![CDATA[', '').replace(']]>', '')
    text = re.sub(r'</p>|<br\\s*/?>', '\\n', text)
    clean_text = re.sub(r'<[^>]+>', '', text)
    return re.sub(r'\\n\\s*\\n', '\\n\\n', clean_text).strip()

def convert_wp_xml_to_csv(xml_file_path, output_csv="kculturejournal_articles.csv"):
    if not os.path.exists(xml_file_path):
        print(f"[오류] 파일을 찾을 수 없습니다: {xml_file_path}")
        return

    namespaces = {
        'content': 'http://purl.org/rss/1.0/modules/content/',
        'dc': 'http://purl.org/dc/elements/1.1/',
        'wp': 'http://wordpress.org/export/1.2/'
    }

    headers = [
        '기사ID', '제목', '카테고리', '태그', '작성기자', 
        '발행일시', '상태', '요약문', '본문내용', '원문링크'
    ]

    count = 0
    with open(output_csv, mode='w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f, quoting=csv.QUOTE_ALL)
        writer.writerow(headers)

        context = ET.iterparse(xml_file_path, events=('end',))
        for event, elem in context:
            if elem.tag == 'item':
                post_type = elem.find('wp:post_type', namespaces)
                if post_type is None or post_type.text in ['post', 'news', 'article']:
                    p_id = elem.find('wp:post_id', namespaces)
                    post_id = p_id.text if p_id is not None else ""
                    
                    t = elem.find('title')
                    title = clean_html(t.text) if t is not None and t.text else ""
                    
                    c = elem.find('dc:creator', namespaces)
                    author = c.text if c is not None and c.text else "편집국"
                    
                    pub = elem.find('pubDate')
                    pub_date = pub.text if pub is not None and pub.text else ""
                    
                    st = elem.find('wp:status', namespaces)
                    status = st.text if st is not None else "publish"
                    
                    cats = [cat.text for cat in elem.findall('category') if cat.get('domain') == 'category' and cat.text]
                    tags = [t.text for t in elem.findall('category') if t.get('domain') in ['post_tag', 'tag'] and t.text]
                    
                    cnt = elem.find('content:encoded', namespaces)
                    content = clean_html(cnt.text) if cnt is not None and cnt.text else ""
                    
                    exc = elem.find('excerpt:encoded', namespaces)
                    excerpt = clean_html(exc.text) if exc is not None and exc.text else content[:120] + "..."
                    
                    lnk = elem.find('link')
                    link = lnk.text if lnk is not None and lnk.text else ""
                    
                    writer.writerow([post_id, title, " | ".join(cats), ", ".join(tags), author, pub_date, status, excerpt, content, link])
                    count += 1
            elem.clear()

    print(f"\\n[성공] 총 {count}건의 기사가 '{output_csv}' 파일로 완벽히 추출되었습니다!")

if __name__ == '__main__':
    target = sys.argv[1] if len(sys.argv) > 1 else 'wordpress_backup.xml'
    convert_wp_xml_to_csv(target)
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPy = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wp_xml_to_csv.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#fcfaf7] border border-[#d8d3cb] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#1b2a47] text-white flex items-center justify-between border-b border-[#2d3e5f]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 rounded-xl text-amber-300 border border-amber-400/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif-kr text-base font-bold">워드프레스 2,000개 기사 XML &rarr; 구글시트 CSV 변환기</h3>
              <p className="text-[11px] text-slate-300 font-sans">
                대용량 백업 파일 스트리밍 파이썬(Python) 추출 도구
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans bg-white">
          
          {/* Quick Guide */}
          <div className="p-4 bg-[#f8f6f2] rounded-xl border border-[#d8d3cb] space-y-2">
            <h4 className="font-serif-kr font-bold text-slate-900 flex items-center gap-1.5 text-sm">
              <Terminal className="w-4 h-4 text-[#1b2a47]" />
              <span>내 컴퓨터에서 3초 만에 실행하는 초간단 방법</span>
            </h4>
            <ol className="list-decimal list-inside text-slate-700 space-y-1 leading-relaxed">
              <li>아래의 <strong>[파이썬 코드 다운로드 (.py)]</strong> 버튼을 눌러 파일을 받습니다.</li>
              <li>내 컴퓨터의 폴더에 파이썬 파일과 워드프레스 XML 백업 파일을 같이 넣습니다.</li>
              <li>터미널(또는 CMD)에서 <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono font-bold text-[#1b2a47]">python wp_xml_to_csv.py 파일이름.xml</code> 을 입력하고 엔터를 칩니다.</li>
              <li>생성된 <strong className="text-[#1b2a47]">kculturejournal_articles.csv</strong> 파일을 구글 스프레드시트나 엑셀에서 [가져오기]로 열면 끝납니다!</li>
            </ol>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="font-bold text-slate-800 font-serif-kr">추출 파이썬 소스코드 (스트리밍 메모리 절약형)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-bold flex items-center gap-1.5 transition-colors border border-slate-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사 완료!' : '코드 복사'}</span>
              </button>
              <button
                onClick={handleDownloadPy}
                className="px-3 py-1.5 bg-[#1b2a47] hover:bg-[#283d63] text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-amber-300" />
                <span>wp_xml_to_csv.py 다운로드</span>
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="bg-[#1e293b] text-slate-200 p-4 rounded-xl font-mono text-[11px] overflow-x-auto max-h-64 border border-slate-800 leading-relaxed scrollbar-thin">
            <pre>{pythonCode}</pre>
          </div>

          {/* Features Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>한글 깨짐 없는 UTF-8 BOM 인코딩</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                엑셀 및 구글 스프레드시트에서 열었을 때 한글이나 특수기호가 전혀 깨지지 않도록 자동 처리됩니다.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900">
              <div className="flex items-center gap-1.5 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>HTML 태그 자동 정제 및 줄바꿈 복원</span>
              </div>
              <p className="text-[11px] text-blue-800 leading-relaxed">
                워드프레스의 불필요한 태그와 CDATA를 깔끔한 기사 단락 텍스트로 자동 정제하여 추출합니다.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-[#f5f1eb] border-t border-[#e2ded6] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#1b2a47] text-white rounded-lg font-bold hover:bg-[#25375c] transition-colors text-xs"
          >
            창 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
