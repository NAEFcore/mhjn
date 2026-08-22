// Google Apps Script (GAS) Backend Mailer & Spreadsheet Sync Code Template
// This script runs entirely for free on Google's cloud infrastructure without server costs.

export const GOOGLE_APPS_SCRIPT_MAILER_CODE = `/**
 * ============================================================================
 * 한국문화저널 (Korea Culture Journal)
 * 독자 기사제보 실시간 네이버 메일(soobakmu@naver.com) 자동 발송 Google Apps Script
 * ============================================================================
 * 
 * [무료 배포 및 설정 방법 (1분 소요)]
 * 1. Google Drive(drive.google.com)에서 [새로 만들기] -> [Google 스프레드시트]를 하나 만듭니다.
 * 2. 시트 상단 1행 헤더에 [접수일시, 제보자, 연락처, 제보제목, 제보내용, 첨부링크]를 입력합니다.
 * 3. 상단 메뉴에서 [확장 프로그램] -> [Apps Script]를 클릭합니다.
 * 4. 기존 코드를 모두 지우고 이 스크립트 전체를 복사하여 붙여넣고 저장(Ctrl+S)합니다.
 * 5. 우측 상단 파란색 [배포] -> [새 배포] 클릭:
 *    - 톱니바퀴 아이콘 -> '웹 앱(Web App)' 선택
 *    - 설명: 한국문화저널 기사제보 메일러
 *    - 다음 사용자로 실행: '나(내 계정)'
 *    - 액세스 권한이 있는 사용자: '모든 사용자(Anyone)'  <-- 중요!
 * 6. [배포]를 누르고 권한을 승인(고급 -> 계속)한 뒤 발급되는 '웹 앱 URL'을 복사하여
 *    한국문화저널 앱의 [기사제보 창구] 설정창에 등록하면 연동이 완료됩니다!
 */

const RECIPIENT_EMAIL = "soobakmu@naver.com"; // 편집국장 수신 네이버 메일 주소

function doPost(e) {
  try {
    var data = {};
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        data = e.parameter || {};
      }
    } else {
      data = e.parameter || {};
    }

    var informer = data.informer || "익명 제보자";
    var contact = data.contact || "미기재";
    var title = data.title || "무제 기사제보";
    var content = data.content || "제보 내용 없음";
    var attachment = data.attachment || "없음";
    var submittedAt = data.submittedAt || new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });

    // 1. 구글 스프레드시트에 영구 보관 (자동 행 추가)
    try {
      var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      sheet.appendRow([submittedAt, informer, contact, title, content, attachment]);
    } catch (sheetError) {
      Logger.log("Sheet Error: " + sheetError.toString());
    }

    // 2. 편집국장 개인 네이버 메일(soobakmu@naver.com)로 MailApp.sendEmail 실시간 자동 발송
    var emailSubject = "[한국문화저널 긴급 기사제보] " + title;
    
    var textBody = 
      "====================================================\\n" +
      "■ [한국문화저널 독자 실시간 기사제보 접수]\\n" +
      "====================================================\\n\\n" +
      "• 접수일시: " + submittedAt + "\\n" +
      "• 제 보 자: " + informer + "\\n" +
      "• 연 락 처: " + contact + "\\n\\n" +
      "----------------------------------------------------\\n" +
      "▶ 제보 제목: " + title + "\\n" +
      "----------------------------------------------------\\n\\n" +
      "▶ 제보 상세 내용:\\n" +
      content + "\\n\\n" +
      "----------------------------------------------------\\n" +
      "▶ 첨부자료 및 링크: " + attachment + "\\n" +
      "====================================================\\n" +
      "※ 취재원 비밀보호 원칙에 따라 제보자의 신원을 안전하게 보호하며 취재에 활용하시기 바랍니다.";

    var htmlBody = 
      "<div style='font-family: sans-serif; max-width: 650px; border: 1px solid #d8d3cb; border-radius: 12px; overflow: hidden; background: #ffffff;'>" +
      "  <div style='background: #1b2a47; color: #ffffff; padding: 18px 24px; border-bottom: 3px solid #d97706;'>" +
      "    <h2 style='margin: 0; font-size: 18px;'>한국문화저널 독자 기사제보 접수</h2>" +
      "    <p style='margin: 4px 0 0 0; font-size: 12px; color: #cbd5e1;'>수신: 편집국장 직통 (soobakmu@naver.com)</p>" +
      "  </div>" +
      "  <div style='padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;'>" +
      "    <table style='width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 13px;'>" +
      "      <tr style='background: #f8fafc; border-bottom: 1px solid #e2e8f0;'><td style='padding: 8px 12px; font-weight: bold; width: 90px;'>제보자</td><td style='padding: 8px 12px;'>" + informer + "</td></tr>" +
      "      <tr style='border-bottom: 1px solid #e2e8f0;'><td style='padding: 8px 12px; font-weight: bold;'>연락처</td><td style='padding: 8px 12px;'>" + contact + "</td></tr>" +
      "      <tr style='background: #f8fafc; border-bottom: 1px solid #e2e8f0;'><td style='padding: 8px 12px; font-weight: bold;'>접수일시</td><td style='padding: 8px 12px;'>" + submittedAt + "</td></tr>" +
      "    </table>" +
      "    <div style='background: #f1f5f9; padding: 14px; border-radius: 8px; font-weight: bold; font-size: 15px; color: #0f172a; margin-bottom: 16px; border-left: 4px solid #1b2a47;'>" +
      "      " + title +
      "    </div>" +
      "    <div style='background: #ffffff; border: 1px solid #e2e8f0; padding: 18px; border-radius: 8px; white-space: pre-wrap; font-size: 14px; color: #1e293b;'>" +
      "      " + content +
      "    </div>" +
      "    <div style='margin-top: 16px; font-size: 12px; color: #64748b; background: #f8fafc; padding: 10px; border-radius: 6px;'>" +
      "      <strong>첨부/참고링크:</strong> " + attachment +
      "    </div>" +
      "  </div>" +
      "  <div style='background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 24px; font-size: 11px; color: #94a3b8; text-align: center;'>" +
      "    한국문화저널 (Korea Culture Journal) · 취재원 신원보호 원칙 준수" +
      "  </div>" +
      "</div>";

    MailApp.sendEmail({
      to: RECIPIENT_EMAIL,
      subject: emailSubject,
      body: textBody,
      htmlBody: htmlBody
    });

    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      message: "기사제보가 편집국장(soobakmu@naver.com)에게 성공적으로 전달되었습니다." 
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "error", 
      message: error.toString() 
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ 
    status: "ok", 
    service: "Korea Culture Journal Tip Mailer", 
    recipient: RECIPIENT_EMAIL 
  })).setMimeType(ContentService.MimeType.JSON);
}
`;

/**
 * Spreadsheet 7-column row mapping parser
 * Structure: [기사ID, 카테고리, 한국어_제목, 한국어_본문, 영어_제목, 영어_본문, 작성일]
 */
export interface SheetRowArticle {
  id: string;
  category: string;
  titleKo: string;
  contentKo: string;
  titleEn: string;
  contentEn: string;
  publishedAt?: string;
}

export function parseSpreadsheetRowsToArticles(rows: any[]): SheetRowArticle[] {
  if (!Array.isArray(rows)) return [];
  
  return rows.map((row: any, idx: number) => {
    // If row is an object with named properties
    if (!Array.isArray(row) && typeof row === 'object' && row !== null) {
      return {
        id: String(row.id || row['기사ID'] || `sheet-art-${idx + 1}`),
        category: String(row.category || row['카테고리'] || 'culture_art'),
        titleKo: String(row.titleKo || row['한국어_제목'] || row.title || ''),
        contentKo: String(row.contentKo || row['한국어_본문'] || row.content || ''),
        titleEn: String(row.titleEn || row['영어_제목'] || ''),
        contentEn: String(row.contentEn || row['영어_본문'] || ''),
        publishedAt: String(row.publishedAt || row['작성일'] || new Date().toISOString().split('T')[0]),
      };
    }

    // If row is a 7-column array: [0: id, 1: category, 2: titleKo, 3: contentKo, 4: titleEn, 5: contentEn, 6: publishedAt]
    const rowArr = Array.isArray(row) ? row : [];
    const id = String(rowArr[0] || `sheet-art-${idx + 1}`);
    const category = String(rowArr[1] || 'culture_art');
    const titleKo = String(rowArr[2] || '');
    const contentKo = String(rowArr[3] || '');
    const titleEn = String(rowArr[4] || '');
    const contentEn = String(rowArr[5] || '');
    const publishedAt = String(rowArr[6] || new Date().toISOString().split('T')[0]);

    return {
      id,
      category,
      titleKo,
      contentKo,
      titleEn,
      contentEn,
      publishedAt,
    };
  });
}

export const parseArticlesFromGoogleSheets = parseSpreadsheetRowsToArticles;
export const GOOGLE_APPS_SCRIPT_NEWS_TIP_CODE = GOOGLE_APPS_SCRIPT_MAILER_CODE;
