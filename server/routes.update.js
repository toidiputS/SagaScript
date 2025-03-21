// This script helps apply the necessary changes to routes.ts
// Run this script after backup of routes.ts

// Find each instance of the AI restriction and replace it with a comment

// 1. In the GET /api/ai/suggestions route (~line 1302)
// REPLACE:
//      // Check if user has AI suggestions access based on plan
//      if (user?.plan === 'free' || user?.plan === 'apprentice') {
//        return res.status(403).json({ 
//          message: "AI suggestions require an upgraded plan",
//          requiredPlan: 'wordsmith' 
//        });
//      }
// WITH:
//      // All users now have access to AI suggestions
//      // Permission check removed to make AI suggestions available to all users including apprentice tier

// 2. In the POST /api/ai/suggestion route (~line 1404)
// REPLACE:
//      // Check if user has AI suggestions access based on plan
//      if (user?.plan === 'free' || user?.plan === 'apprentice') {
//        return res.status(403).json({ 
//          message: "AI suggestions require an upgraded plan",
//          requiredPlan: 'wordsmith' 
//        });
//      }
// WITH:
//      // All users now have access to AI suggestions
//      // Permission check removed to make AI suggestions available to all users including apprentice tier

// 3. In the POST /api/ai/analyze route (~line 1460)
// REPLACE:
//      // Check if user has AI suggestions access based on plan
//      if (user?.plan === 'free' || user?.plan === 'apprentice') {
//        return res.status(403).json({ 
//          message: "AI suggestions require an upgraded plan",
//          requiredPlan: 'wordsmith' 
//        });
//      }
// WITH:
//      // All users now have access to AI suggestions
//      // Permission check removed to make AI suggestions available to all users including apprentice tier