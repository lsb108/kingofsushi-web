# Requirements Document

## Introduction

Xây dựng trang web nhà hàng Sushi hoàn chỉnh mang tên "King of Sushi" — một ứng dụng web đặt món trực tuyến tương tự sushi-for-friends.de. Hệ thống bao gồm giao diện thực đơn dạng lưới với ảnh món ăn, giỏ hàng sidebar, xác thực người dùng qua OAuth (Gmail, Facebook, Apple), thanh toán qua Stripe, và một Admin Panel để quản lý thực đơn. Dự án được xây dựng trên nền React + Vite (frontend) và Node.js/Express (backend), triển khai trên Vercel.

## Glossary

- **SpeiseKarte**: Trang thực đơn hiển thị tất cả các món ăn theo danh mục
- **Warenkorb**: Giỏ hàng dạng sidebar bên phải màn hình
- **Gutschein**: Mã giảm giá do khách hàng nhập vào
- **Admin Panel**: Giao diện quản trị dành riêng cho nhân viên nhà hàng
- **System**: Toàn bộ ứng dụng web King of Sushi
- **Frontend**: Ứng dụng React chạy trên trình duyệt
- **Backend**: Server Node.js/Express cung cấp REST API
- **Auth_Service**: Dịch vụ xác thực người dùng (Firebase Auth)
- **Payment_Service**: Dịch vụ thanh toán Stripe
- **Menu_Manager**: Module quản lý thực đơn trong Admin Panel
- **Cart**: Trạng thái giỏ hàng phía client
- **User**: Khách hàng đã đăng nhập hoặc khách vãng lai
- **Admin**: Nhân viên nhà hàng có quyền quản trị

---

## Requirements

### Requirement 1: Hiển thị Thực Đơn (SpeiseKarte)

**User Story:** As a User, I want to browse the menu organized by categories with photos, names, descriptions, and prices, so that I can easily find and select dishes to order.

#### Acceptance Criteria

1. THE Frontend SHALL display all menu items grouped by category (e.g., Sashimi & Mehr, Sides, Menüs, Inside Out, Maki, Nigiri, Rocket Rolls, Tempura Rolls, Bowls, Vega).
2. THE Frontend SHALL display each menu item with an image, name, description, and price in Euro format (e.g., €12.50).
3. THE Frontend SHALL render menu items in a responsive grid layout with a minimum of 2 columns on desktop and 1 column on mobile (viewport width < 768px).
4. WHEN a User clicks a category name in the navigation bar, THE Frontend SHALL scroll to the corresponding category section within 300ms.
5. THE Frontend SHALL display a sticky navigation bar listing all available categories so that the User can jump to any category without scrolling manually.
6. WHEN a menu item image fails to load, THE Frontend SHALL display a placeholder image so that the layout is not broken.
7. WHEN the Backend returns menu data, THE Frontend SHALL render all categories and items within 2 seconds on a standard broadband connection.

---

### Requirement 2: Giỏ Hàng (Warenkorb)

**User Story:** As a User, I want to manage my selected items in a sidebar cart, so that I can review, adjust quantities, apply discount codes, and see the total before checkout.

#### Acceptance Criteria

1. WHEN a User clicks "Add to Order" on a menu item, THE Cart SHALL add the item and display the Warenkorb sidebar.
2. WHILE the Warenkorb is open, THE Frontend SHALL display each cart item with its image, name, unit price, quantity controls (+ and −), and line total.
3. WHEN a User clicks the "+" button for a cart item, THE Cart SHALL increment that item's quantity by 1.
4. WHEN a User clicks the "−" button for a cart item with quantity greater than 1, THE Cart SHALL decrement that item's quantity by 1.
5. WHEN a User clicks the "−" button for a cart item with quantity equal to 1, THE Cart SHALL remove that item from the cart.
6. WHEN a User clicks the remove (×) icon on a cart item, THE Cart SHALL remove that item from the cart immediately.
7. THE Frontend SHALL display the cart item count as a badge on the cart icon in the navigation bar, updating in real time as items are added or removed.
8. THE Frontend SHALL display the subtotal, any applied discount, and the final total in the Warenkorb footer.
9. WHEN a User enters a valid Gutschein code and clicks "Apply", THE Cart SHALL apply the corresponding discount percentage to the subtotal and display the discounted total.
10. IF a User enters an invalid or expired Gutschein code, THEN THE Frontend SHALL display an error message "Ungültiger Gutscheincode" below the input field.
11. THE Frontend SHALL display a minimum order value notice (e.g., "Mindestbestellwert: €15.00") when the cart total is below the threshold.

---

### Requirement 3: Xác Thực Người Dùng (OAuth Login)

**User Story:** As a User, I want to sign in using my existing Google, Facebook, or Apple account, so that I can save my order history and delivery addresses without creating a new password.

#### Acceptance Criteria

1. THE Frontend SHALL display login options for Google, Facebook, and Apple OAuth providers on the login page.
2. WHEN a User clicks "Sign in with Google", THE Auth_Service SHALL initiate the Google OAuth 2.0 flow and redirect the User back to the application upon success.
3. WHEN a User clicks "Sign in with Facebook", THE Auth_Service SHALL initiate the Facebook OAuth flow and redirect the User back to the application upon success.
4. WHEN a User clicks "Sign in with Apple", THE Auth_Service SHALL initiate the Apple Sign-In flow and redirect the User back to the application upon success.
5. WHEN a User successfully authenticates, THE Frontend SHALL display the User's name and profile picture in the navigation bar.
6. IF an OAuth authentication attempt fails, THEN THE Frontend SHALL display an error message "Anmeldung fehlgeschlagen. Bitte versuche es erneut." and allow the User to retry.
7. WHEN a User clicks "Logout", THE Auth_Service SHALL invalidate the session and THE Frontend SHALL return to the unauthenticated state within 1 second.
8. THE Auth_Service SHALL store the authenticated User's profile (name, email, provider ID) in the database so that order history can be associated with the User.
9. WHERE a User is not authenticated, THE Frontend SHALL allow guest checkout without requiring login.

---

### Requirement 4: Thanh Toán (Stripe Integration)

**User Story:** As a User, I want to pay for my order securely using a credit card or other payment methods via Stripe, so that I can complete my purchase without leaving the website.

#### Acceptance Criteria

1. WHEN a User clicks "Proceed to Checkout" in the Warenkorb, THE Frontend SHALL display a checkout form with delivery address fields and a Stripe payment element.
2. THE Payment_Service SHALL create a Stripe PaymentIntent on the Backend with the exact order total in EUR before displaying the payment form to the User.
3. WHEN a User submits valid payment details, THE Payment_Service SHALL confirm the Stripe PaymentIntent and THE Frontend SHALL display an order confirmation screen with an order ID.
4. IF the Stripe payment fails (e.g., card declined), THEN THE Frontend SHALL display the Stripe error message and allow the User to correct payment details and retry.
5. THE Backend SHALL validate the order total server-side against the menu prices before creating the PaymentIntent, so that the User cannot manipulate the price client-side.
6. WHEN a payment is successfully confirmed, THE Backend SHALL record the order with status "Confirmed" and associate it with the User's account (or guest session).
7. THE Payment_Service SHALL support payment methods: Visa, Mastercard, and SEPA Debit.
8. THE Frontend SHALL display a loading indicator while the PaymentIntent is being created and while payment confirmation is in progress.

---

### Requirement 5: Admin Panel

**User Story:** As an Admin, I want a dedicated management interface to add, edit, and delete menu items with images, so that I can keep the menu up to date without touching the codebase.

#### Acceptance Criteria

1. THE Frontend SHALL provide a separate Admin Panel route (e.g., `/admin`) that is not accessible to unauthenticated users.
2. WHEN an unauthenticated user navigates to `/admin`, THE Frontend SHALL redirect them to the Admin login page.
3. THE Admin Panel SHALL authenticate Admins using email and password credentials stored securely in the Auth_Service, separate from customer OAuth accounts.
4. WHEN an Admin is authenticated, THE Admin Panel SHALL display a list of all menu categories and items with their current images, names, descriptions, and prices.
5. WHEN an Admin clicks "Add Item", THE Menu_Manager SHALL display a form with fields for category, name, description, price, and image upload.
6. WHEN an Admin submits a valid "Add Item" form, THE Menu_Manager SHALL save the new item to the data store and THE Admin Panel SHALL display the new item in the list within 2 seconds.
7. WHEN an Admin clicks "Edit" on an existing item, THE Menu_Manager SHALL display a pre-filled form with the item's current data.
8. WHEN an Admin submits a valid "Edit Item" form, THE Menu_Manager SHALL update the item in the data store and THE Admin Panel SHALL reflect the changes within 2 seconds.
9. WHEN an Admin clicks "Delete" on an existing item and confirms the action, THE Menu_Manager SHALL remove the item from the data store and THE Admin Panel SHALL remove it from the list within 2 seconds.
10. THE Menu_Manager SHALL accept image uploads in JPEG, PNG, and WebP formats with a maximum file size of 5MB per image.
11. IF an Admin uploads an image exceeding 5MB, THEN THE Menu_Manager SHALL display an error message "Bild zu groß. Maximale Dateigröße: 5MB" and reject the upload.
12. THE Admin Panel SHALL display a link to the Stripe Dashboard so that the Admin can review payments and refunds without leaving the admin interface.

---

### Requirement 6: Navigation und Layout

**User Story:** As a User, I want a clear and responsive navigation experience, so that I can use the website comfortably on both desktop and mobile devices.

#### Acceptance Criteria

1. THE Frontend SHALL display a sticky header containing the restaurant logo, category navigation links, and the cart icon with item count badge.
2. WHILE a User scrolls past 50px from the top of the page, THE Frontend SHALL apply a background color to the header so that it remains readable against the page content.
3. THE Frontend SHALL be fully responsive and usable on viewport widths from 320px to 2560px.
4. WHEN a User is on a mobile device (viewport width < 768px), THE Frontend SHALL display a hamburger menu icon that toggles the category navigation.
5. THE Frontend SHALL display a hero section at the top of the SpeiseKarte page with the restaurant name, a tagline, and a call-to-action button linking to the menu.
6. THE Frontend SHALL display a footer with contact information (address, phone, email), navigation links (Impressum, Datenschutz, AGB), and copyright notice.

---

### Requirement 7: Bestellverlauf (Order History)

**User Story:** As a User, I want to view my past orders after logging in, so that I can reorder favorite items or track my spending.

#### Acceptance Criteria

1. WHEN an authenticated User navigates to their profile page, THE Frontend SHALL display a list of past orders sorted by date descending.
2. THE Frontend SHALL display each past order with the order ID, date, list of items, and total amount paid.
3. WHEN an authenticated User clicks "Reorder" on a past order, THE Cart SHALL add all items from that order to the current cart.
4. IF an authenticated User has no past orders, THEN THE Frontend SHALL display the message "Noch keine Bestellungen vorhanden."
5. THE Backend SHALL return only orders belonging to the authenticated User, so that one User cannot view another User's order history.

---

### Requirement 8: Leistung und Zuverlässigkeit (Performance & Reliability)

**User Story:** As a User, I want the website to load quickly and remain available, so that I can place orders without frustration.

#### Acceptance Criteria

1. THE Frontend SHALL achieve a Lighthouse Performance score of at least 80 on desktop when measured on the production build.
2. THE Frontend SHALL lazy-load menu item images so that only images in or near the viewport are fetched on initial page load.
3. THE Backend SHALL respond to `/api/menu` GET requests within 500ms under normal load (up to 100 concurrent requests).
4. IF the Backend is unreachable, THEN THE Frontend SHALL display a user-friendly error message "Der Server ist momentan nicht erreichbar. Bitte versuche es später erneut." instead of a blank page.
5. THE Frontend SHALL cache the menu data in browser memory for the duration of the session so that navigating between categories does not trigger repeated API calls.
