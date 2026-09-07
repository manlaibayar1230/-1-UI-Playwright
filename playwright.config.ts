import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright-ийн үндсэн тохиргоо.
 * Дэлгэрэнгүй: https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  // Тестийн файлууд хаана байгааг заана
  testDir: './tests',

  // Тестүүд хоорондоо хамааралгүй тул зэрэгцүүлж (parallel) ажиллуулж болно
  fullyParallel: true,

  // CI орчинд санамсаргүй .only үлдсэн бол алдаа өгнө
  forbidOnly: !!process.env.CI,

  // CI дээр л дахин оролдлого хийнэ (retry), локал дээр 0
  retries: process.env.CI ? 2 : 0,

  // HTML тайлан үүсгэнэ — npx playwright show-report -ээр үзнэ
  reporter: 'html',

  use: {
    // Бүх тестийн үндсэн URL
    baseURL: 'https://www.saucedemo.com',

    // Trace: алдаа гарсан тестийн алхам бүрийг дахин тоглуулах боломжтой болгоно
    // "on" үед бүх тестийн trace бичигдэнэ (лабораторийн шаардлагаар on болгосон)
    trace: 'on',

    // Алдаа гарсан үед screenshot авна
    screenshot: 'only-on-failure',

    // Видео бичлэг — алдаа гарсан тестийг л хадгална (диск дүүргэхгүйн тулд)
    video: 'retain-on-failure',
  },

  // Зөвхөн Chromium дээр ажиллуулна (лабораторийн хэмжээнд хангалттай, хурдан)
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Хэрэв бусад хөтчөөр шалгах хэрэгтэй бол доорхийг тайлбараас гаргана
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
  ],
});
