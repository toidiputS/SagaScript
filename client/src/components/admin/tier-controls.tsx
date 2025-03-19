
import { useState } from 'react';
import { Button } from '../ui/button';
import { useAuth } from '@/hooks/use-auth';

const tiers = ['apprentice', 'wordsmith', 'loremaster', 'chronicler'];

export function TierControls() {
  const { user } = useAuth();
  const [selectedTier, setSelectedTier] = useState(user?.tier || 'apprentice');

  const handleTierChange = async (tier: string) => {
    try {
      const response = await fetch('/api/admin/switch-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          plan: tier
        }),
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to switch tier');
      
      window.location.reload();
    } catch (error) {
      console.error('Error switching tier:', error);
    }
  };

  if (!user?.isAdmin) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border z-50">
      <h3 className="font-medium mb-2">Admin Controls</h3>
      <div className="space-y-2">
        {tiers.map((tier) => (
          <Button
            key={tier}
            variant={selectedTier === tier ? "default" : "outline"}
            className="w-full"
            onClick={() => handleTierChange(tier)}
          >
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Button>
        ))}
      </div>
    </div>
  );
}
