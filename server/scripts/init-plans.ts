import { initializeSubscriptionPlans } from '../models/subscription-plans';

// This script will initialize subscription plans regardless of whether they already exist
async function run() {
  try {
    console.log('[Script] Running subscription plan initialization...');
    await initializeSubscriptionPlans(true);
    console.log('[Script] Subscription plans initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Script] Failed to initialize subscription plans:', error);
    process.exit(1);
  }
}

run();