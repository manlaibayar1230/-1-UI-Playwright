import { test, expect } from '@playwright/test';

/**
 * F.CSA313 - Лаборатори №1: UI автомат тест (Playwright)
 * Тестлэх сайт: https://www.saucedemo.com (тест хийх зориулалттай нээлттэй демо дэлгүүр)
 *
 * ЛОКАТОРЫН ТУХАЙ ТАЙЛБАР:
 * Энэ файлд бид Playwright-ийн зөвлөдөг "орчин үеийн" (user-facing) locator-уудыг
 * ашиглана: getByPlaceholder, getByRole, getByText, getByTestId.
 * XPath, CSS class-аар шүүх зэргээс аль болох зайлсхийсэн — учир нь:
 *   1) XPath нь HTML-ийн дотоод бүтцээс (DOM зангилаа, index) хэт хамааралтай тул
 *      хуудасны бүтэц бага зэрэг өөрчлөгдмөгц (жишээ нь div нэмэгдэх, дараалал
 *      солигдох) тест "хугарна" — маш эмзэг (fragile).
 *   2) getByRole/getByLabel/getByText зэрэг нь хэрэглэгч (болон дэлгэц уншигч
 *      screen reader) хуудсыг хэрхэн "хардаг"-тай ижил логикоор элемент хайдаг тул
 *      тест нь илүү тогтвортой бөгөөд нэгэн зэрэг accessibility-г шалгаж өгдөг.
 *   3) getByTestId нь хөгжүүлэгчийн зориуд өгсөн тогтвортой шинж чанар тул дизайн
 *      өөрчлөгдсөн ч эвдрэхгүй.
 *   4) XPath урт бөгөөд уншиход хэцүү (жишээ нь: //div[3]/ul/li[2]/a), харин
 *      getByRole('button', { name: 'Login' }) шиг код өөрөө тайлбар мэт уншигдана.
 */

// Saucedemo-ийн тест хэрэглэгчийн мэдээлэл
const VALID_USERNAME = 'standard_user';
const VALID_PASSWORD = 'secret_sauce';
const INVALID_PASSWORD = 'wrong_password_123';

test.describe('Saucedemo нэвтрэх ба үндсэн үйлдлийн тестүүд', () => {

  // Тест бүр өөрийн гэсэн цэвэр орчинтой эхэлдэг (test isolation):
  // Playwright тест бүрд шинэ browser context (cookie, localStorage хоосон) өгдөг
  // тул beforeEach дотор зөвхөн нийтлэг алхам болох "хуудас руу орох"-ыг тавьсан.
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('1) Амжилттай нэвтрэх - зөв нэр/нууц үгээр', async ({ page }) => {
    // Auto-wait: Playwright элемент DOM-д гарч, харагдах (visible) хүртэл
    // автоматаар хүлээдэг тул бид явцуу explicit wait бичих шаардлагагүй.
    await page.getByPlaceholder('Username').fill(VALID_USERNAME);
    await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    // Нэвтэрсний дараа "Products" хуудас руу шилжсэн эсэхийг шалгах
    await expect(page.getByText('Products')).toBeVisible();
    await expect(page).toHaveURL(/.*inventory.html/);

    // Нэвтэрсний баталгаа болгож бүтээгдэхүүний жагсаалт харагдаж буйг шалгах
    await expect(page.getByTestId('inventory-list')).toBeVisible();
  });

  test('2) Амжилтгүй нэвтрэх - буруу нууц үгээр', async ({ page }) => {
    await page.getByPlaceholder('Username').fill(VALID_USERNAME);
    await page.getByPlaceholder('Password').fill(INVALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();

    // Алдааны мессеж гарч ирснийг шалгах (saucedemo дээр data-test="error" элемент)
    const errorMessage = page.getByTestId('error');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Username and password do not match');

    // Нэвтэрч чадаагүй тул URL-аа login хуудсан дээрээ үлдсэн байх ёстой
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('3) Нэвтэрсний дараах үйлдэл - бараа сагслах', async ({ page }) => {
    // Эхлээд амжилттай нэвтэрнэ (энэ тестэд шаардлагатай урьдчилсан нөхцөл)
    await page.getByPlaceholder('Username').fill(VALID_USERNAME);
    await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Products')).toBeVisible();

    // "Sauce Labs Backpack" бараанд харгалзах "Add to cart" товчийг дарах.
    // getByRole ашиглан товчийг accessible name-ээр нь олж байна.
    await page.getByRole('button', { name: 'Add to cart' }).first().click();

    // Сагсны тоолуур "1" болсныг шалгах
    const cartBadge = page.getByTestId('shopping-cart-badge');
    await expect(cartBadge).toBeVisible();
    await expect(cartBadge).toHaveText('1');

    // Сагс руу орж, барааны нэр зөв харагдаж буйг нягтлах
    await page.getByTestId('shopping-cart-link').click();
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();
  });

  test('4) Гарах (logout) үйлдэл - тестийг зөв төгсгөх', async ({ page }) => {
    // Нэвтрэх
    await page.getByPlaceholder('Username').fill(VALID_USERNAME);
    await page.getByPlaceholder('Password').fill(VALID_PASSWORD);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Products')).toBeVisible();

    // Зүүн дээд булангийн "hamburger" цэсийг нээх
    await page.getByRole('button', { name: 'Open Menu' }).click();

    // "Logout" линк дээр дарж системээс гарах
    await page.getByRole('link', { name: 'Logout' }).click();

    // Дахин login хуудас руу шилжсэн эсэхийг шалгах — сессио цэвэрлэгдсэн баталгаа
    await expect(page.getByPlaceholder('Username')).toBeVisible();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

});
