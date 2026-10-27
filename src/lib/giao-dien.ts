export const KHOA_GIAO_DIEN = "giao-dien";

/**
 * Chạy trong <head> trước khi trang hiện ra, tránh nháy sai màu:
 * dùng lựa chọn đã lưu, chưa chọn thì theo cài đặt của máy (và đổi theo nếu máy đổi).
 */
export const SCRIPT_GIAO_DIEN = `(function(){try{var d=document.documentElement,m=window.matchMedia("(prefers-color-scheme: dark)");function ap(){var t=localStorage.getItem("${KHOA_GIAO_DIEN}");d.setAttribute("data-theme",t==="dark"||t==="light"?t:m.matches?"dark":"light")}ap();m.addEventListener("change",ap)}catch(e){}})()`;
