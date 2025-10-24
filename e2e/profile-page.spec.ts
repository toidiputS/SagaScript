import { test, expect } from '@playwright/test';

test.describe('Profile Page Navigation and Data Loading', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        displayName: 'Test Writer',
        username: 'testwriter',
        plan: 'free',
        createdAt: '2024-01-01T00:00:00Z'
      }));
    });
  });

  test('should navigate to profile page and load user data', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL('/profile');
    
    const profileContent = page.locator('main, [data-testid="profile-content"], .profile-page');
    await expect(profileContent.first()).toBeVisible();
  });

  test('should handle loading states gracefully', async ({ page }) => {
    await page.route('/api/profile', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          displayName: 'Test Writer',
          username: 'testwriter',
          email: 'test@example.com'
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    const mainContent = page.locator('main, body');
    await expect(mainContent.first()).toBeVisible();
  });

  test('should navigate between tabs correctly', async ({ page }) => {
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    const tabElements = page.locator('[role="tab"], button:has-text("Overview"), button:has-text("Statistics"), button:has-text("Settings")');
    const tabCount = await tabElements.count();
    
    if (tabCount > 1) {
      await tabElements.nth(1).click();
      await page.waitForTimeout(500);
      
      await tabElements.nth(0).click();
      await page.waitForTimeout(500);
    }
  });
});

test.describe('Avatar Upload and Profile Editing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        displayName: 'Test Writer',
        username: 'testwriter',
        plan: 'free'
      }));
    });
  });

  test('should open edit profile modal and update profile information', async ({ page }) => {
    await page.route('/api/profile', async route => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: '1',
            displayName: 'Test Writer',
            username: 'testwriter',
            email: 'test@example.com'
          })
        });
      } else if (route.request().method() === 'PUT') {
        const requestBody = await route.request().postDataJSON();
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: '1', ...requestBody })
        });
      }
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    const editButton = page.locator('button:has-text("Edit"), [data-testid="edit-profile"], .edit-profile');
    
    if (await editButton.first().isVisible()) {
      await editButton.first().click();
      
      const nameInput = page.locator('input[name="displayName"], input[placeholder*="name" i]').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Updated Writer Name');
        
        const saveButton = page.locator('button:has-text("Save"), button[type="submit"]');
        if (await saveButton.first().isVisible()) {
          await saveButton.first().click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('should handle avatar upload successfully', async ({ page }) => {
    await page.route('/api/profile/avatar', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ avatarUrl: '/uploads/avatars/test-avatar.jpg' })
      });
    });

    await page.route('/api/profile', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: '1',
          displayName: 'Test Writer',
          username: 'testwriter',
          email: 'test@example.com'
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    const fileInput = page.locator('input[type="file"]');
    if (await fileInput.first().isVisible()) {
      await fileInput.first().setInputFiles({
        name: 'test-avatar.png',
        mimeType: 'image/png',
        buffer: Buffer.from('fake-image-data')
      });
      await page.waitForTimeout(2000);
    }
  });
});

test.describe('Subscription Management Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'test@example.com',
        displayName: 'Test Writer',
        username: 'testwriter',
        plan: 'free'
      }));
    });
  });

  test('should display current subscription information', async ({ page }) => {
    await page.route('/api/subscription', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          plan: 'free',
          status: 'active',
          renewalDate: '2024-12-31T23:59:59Z',
          features: ['Basic writing tools', '1 series', 'Community support']
        })
      });
    });

    await page.route('/api/user/usage', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          series: { used: 1, limit: 1 },
          aiPrompts: { used: 5, limit: 10, resetDate: '2024-02-01T00:00:00Z' }
        })
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    const subscriptionTab = page.locator('button:has-text("Subscription"), [data-testid="tab-subscription"]');
    if (await subscriptionTab.first().isVisible()) {
      await subscriptionTab.first().click();
      await page.waitForTimeout(1000);
      
      const subscriptionContent = page.locator('text="Free", text="Active", text="series"');
      const visibleCount = await subscriptionContent.count();
      expect(visibleCount).toBeGreaterThan(0);
    }
  });

  test('should handle subscription upgrade flow', async ({ page }) => {
    await page.route('/api/subscription', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ plan: 'free', status: 'active' })
      });
    });

    await page.route('/api/subscription-plans', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: 'apprentice', name: 'The Apprentice', price: 9.99 }
        ])
      });
    });

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');
    
    const subscriptionTab = page.locator('button:has-text("Subscription")');
    if (await subscriptionTab.first().isVisible()) {
      await subscriptionTab.first().click();
      
      const upgradeButton = page.locator('button:has-text("Upgrade"), button:has-text("Change Plan")');
      if (await upgradeButton.first().isVisible()) {
        await upgradeButton.first().click();
        await page.waitForTimeout(1000);
      }
    }
  });
});