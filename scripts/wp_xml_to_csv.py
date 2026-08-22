#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한국문화저널 (Korea Culture Journal) - 워드프레스 XML 대용량 백업 to 구글 스프레드시트 CSV 변환기
========================================================================================
용도: 2,000개 이상의 대용량 워드프레스 WXR(XML) 백업 파일을 메모리 부담 없이
      구글 스프레드시트 및 DB 임포트용 표준 CSV 파일(UTF-8 with BOM)로 안전하게 추출합니다.

사용법:
    1. 터미널 또는 명령 프롬프트(CMD)를 엽니다.
    2. 본 파이썬 스크립트와 워드프레스 XML 백업 파일(예: wordpress_backup.xml)을 같은 폴더에 둡니다.
    3. 아래 명령어를 실행합니다:
       python wp_xml_to_csv.py wordpress_backup.xml

결과:
    동일 폴더에 'kculturejournal_articles.csv' 파일이 생성됩니다.
"""

import sys
import os
import csv
import re
import xml.etree.ElementTree as ET
from html import unescape

def clean_html(raw_html):
    """HTML 태그를 제거하고 텍스트를 정돈합니다."""
    if not raw_html:
        return ""
    # HTML 엔티티 복원 (&amp; &lt; 등)
    text = unescape(raw_html)
    # CDATA 표기 정리
    text = text.replace('<![CDATA[', '').replace(']]>', '')
    # 본문 단락 태그를 줄바꿈으로 변경
    text = re.sub(r'</p>|<br\s*/?>', '\n', text)
    # 나머지 태그 제거
    clean_text = re.sub(r'<[^>]+>', '', text)
    # 연속 줄바꿈 3개 이상을 2개로 축소
    clean_text = re.sub(r'\n\s*\n', '\n\n', clean_text)
    return clean_text.strip()

def convert_wp_xml_to_csv(xml_file_path, output_csv_path="kculturejournal_articles.csv"):
    if not os.path.exists(xml_file_path):
        print(f"[오류] XML 파일을 찾을 수 없습니다: {xml_file_path}")
        return

    print(f"[*] 워드프레스 XML 파싱 시작: {xml_file_path}")
    print("[*] 대용량 스트리밍 모드로 처리 중...")

    # 워드프레스 XML 네임스페이스 정의
    namespaces = {
        'content': 'http://purl.org/rss/1.0/modules/content/',
        'wfw': 'http://wellformedweb.org/CommentAPI/',
        'dc': 'http://purl.org/dc/elements/1.1/',
        'wp': 'http://wordpress.org/export/1.2/'
    }

    # CSV 헤더 정의 (구글 스프레드시트 및 한국문화저널 DB 스키마 완벽 호환)
    headers = [
        '기사ID (post_id)',
        '제목 (title)',
        '카테고리 (category)',
        '태그 (tags)',
        '작성자/기자 (author)',
        '발행일시 (pubDate)',
        '상태 (status)',
        '요약/리드문 (excerpt)',
        '본문텍스트 (content)',
        '원문링크 (link)'
    ]

    total_count = 0
    post_count = 0

    try:
        # UTF-8 with BOM ('utf-8-sig')으로 저장하여 엑셀/구글시트에서 한글 깨짐 방지
        with open(output_csv_path, mode='w', encoding='utf-8-sig', newline='') as csv_file:
            writer = csv.writer(csv_file, quoting=csv.QUOTE_ALL)
            writer.writerow(headers)

            # iterparse로 메모리 절약형 스트리밍 파싱
            context = ET.iterparse(xml_file_path, events=('end',))
            
            for event, elem in context:
                if elem.tag == 'item':
                    total_count += 1
                    
                    # post_type 확인 (기사 포스트만 필터링, attachment/page/nav_menu_item 제외)
                    post_type_elem = elem.find('wp:post_type', namespaces)
                    post_type = post_type_elem.text if post_type_elem is not None else 'post'
                    
                    if post_type in ['post', 'news', 'article']:
                        # 1. Post ID
                        post_id_elem = elem.find('wp:post_id', namespaces)
                        post_id = post_id_elem.text if post_id_elem is not None else f"wp-{total_count}"

                        # 2. Title
                        title_elem = elem.find('title')
                        title = clean_html(title_elem.text) if (title_elem is not None and title_elem.text) else "무제 기사"

                        # 3. Creator / Reporter
                        creator_elem = elem.find('dc:creator', namespaces)
                        author = creator_elem.text if (creator_elem is not None and creator_elem.text) else "한국문화저널 편집국"

                        # 4. PubDate
                        pub_elem = elem.find('pubDate')
                        pub_date = pub_elem.text if (pub_elem is not None and pub_elem.text) else ""

                        # 5. Status (publish, draft 등)
                        status_elem = elem.find('wp:status', namespaces)
                        status = status_elem.text if status_elem is not None else "publish"

                        # 6. Categories & Tags
                        categories = []
                        tags = []
                        for cat_elem in elem.findall('category'):
                            domain = cat_elem.get('domain', '')
                            nicename = cat_elem.text or ''
                            if domain == 'category' and nicename:
                                categories.append(nicename)
                            elif domain in ['post_tag', 'tag'] and nicename:
                                tags.append(nicename)

                        category_str = " | ".join(categories) if categories else "문화·예술"
                        tag_str = ", ".join(tags)

                        # 7. Content (content:encoded)
                        content_elem = elem.find('content:encoded', namespaces)
                        content = clean_html(content_elem.text) if (content_elem is not None and content_elem.text) else ""

                        # 8. Excerpt (excerpt:encoded)
                        excerpt_elem = elem.find('excerpt:encoded', namespaces)
                        excerpt = clean_html(excerpt_elem.text) if (excerpt_elem is not None and excerpt_elem.text) else ""
                        if not excerpt and content:
                            excerpt = content[:150] + "..."

                        # 9. Link
                        link_elem = elem.find('link')
                        link = link_elem.text if (link_elem is not None and link_elem.text) else ""

                        # CSV 행 작성
                        writer.writerow([
                            post_id,
                            title,
                            category_str,
                            tag_str,
                            author,
                            pub_date,
                            status,
                            excerpt,
                            content,
                            link
                        ])
                        
                        post_count += 1
                        if post_count % 100 == 0:
                            print(f"[진행중] 기사 {post_count}건 변환 완료...")

                    # 처리된 XML 엘리먼트 메모리 해제
                    elem.clear()

        print(f"\n=======================================================")
        print(f"[완료] 총 {post_count}개의 기사가 CSV로 성공적으로 변환되었습니다!")
        print(f"[저장 파일 경로] {os.path.abspath(output_csv_path)}")
        print(f"=======================================================")
        print("💡 구글 스프레드시트 사용법:")
        print("   1. https://sheets.google.com 접속 -> 새 스프레드시트 열기")
        print("   2. [파일] -> [가져오기] -> [업로드] 클릭 후 생성된 CSV 파일 선택")
        print("   3. 구분 기호 '자동 감지'로 열면 2,000개 기사가 표로 완벽히 정렬됩니다.")

    except Exception as e:
        print(f"\n[오류 발생] 변환 중 오류가 발생했습니다: {str(e)}")

if __name__ == '__main__':
    # 인자로 파일명이 전달되었는지 확인
    if len(sys.argv) > 1:
        input_file = sys.argv[1]
    else:
        # 기본 파일 탐색
        candidates = [f for f in os.listdir('.') if f.endswith('.xml')]
        if candidates:
            input_file = candidates[0]
            print(f"[*] XML 파일을 자동으로 감지했습니다: {input_file}")
        else:
            print("사용법: python wp_xml_to_csv.py [워드프레스_백업파일.xml]")
            sys.exit(1)

    convert_wp_xml_to_csv(input_file)
