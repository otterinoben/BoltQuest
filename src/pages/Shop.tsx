import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  getShopCategories, 
  getAvailableItems, 
  getComingSoonItems, 
  purchaseItem, 
  getUserInventory,
  userOwnsItem,
  equipItem,
  getEquippedItems,
  checkItemUnlocked
} from '@/lib/shopSystem';
import { getCoinBalance } from '@/lib/coinSystem';
import { ShopItem, ShopCategory } from '@/types/shop';
import { 
  Coins, 
  ShoppingCart, 
  Star, 
  Lock, 
  Check, 
  Zap, 
  Crown, 
  Gem,
  User,
  Palette,
  Trophy,
  Settings,
  Moon,
  Sparkles,
  Circle,
  Briefcase,
  Users,
  Heart,
  Shield,
  Edit,
  BarChart3,
  Headphones,
  Rocket,
  Sparkle,
  Gift,
  Award
} from 'lucide-react';
import { toast } from 'sonner';
import UnlockAnimation from '@/components/UnlockAnimation';
import CoinDisplay from '@/components/CoinDisplay';

const Shop: React.FC = () => {
  const [categories, setCategories] = useState<ShopCategory[]>([]);
  const [availableItems, setAvailableItems] = useState<ShopItem[]>([]);
  const [comingSoonItems, setComingSoonItems] = useState<ShopItem[]>([]);
  const [inventory, setInventory] = useState(getUserInventory());
  const [equippedItems, setEquippedItems] = useState<{ [category: string]: string }>({});
  const [coinBalance, setCoinBalance] = useState(0);
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [showPurchaseDialog, setShowPurchaseDialog] = useState(false);
  const [showNotEnoughCoinsDialog, setShowNotEnoughCoinsDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('badges');
  const [showUnlockPopup, setShowUnlockPopup] = useState(false);
  const [unlockedItem, setUnlockedItem] = useState<ShopItem | null>(null);

  useEffect(() => {
    loadShopData();
    loadUserData();
  }, []);

  const loadShopData = () => {
    setCategories(getShopCategories());
    setAvailableItems(getAvailableItems());
    setComingSoonItems(getComingSoonItems());
  };

  const loadUserData = () => {
    setInventory(getUserInventory());
    setEquippedItems(getEquippedItems());
    setCoinBalance(getCoinBalance());
  };

  const getRarityIcon = (rarity: ShopItem['rarity']) => {
    switch (rarity) {
      case 'common': return <Star className="w-4 h-4 text-gray-500" />;
      case 'rare': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'epic': return <Crown className="w-4 h-4 text-purple-500" />;
      case 'legendary': return <Gem className="w-4 h-4 text-yellow-500" />;
      default: return <Star className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRarityGradient = (rarity: ShopItem['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-50 to-gray-100 border-gray-200';
      case 'rare': return 'from-blue-50 to-blue-100 border-blue-200';
      case 'epic': return 'from-purple-50 to-purple-100 border-purple-200';
      case 'legendary': return 'from-yellow-50 to-yellow-100 border-yellow-200';
      default: return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  const getRarityGlow = (rarity: ShopItem['rarity']) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-100';
      case 'rare': return 'shadow-blue-100';
      case 'epic': return 'shadow-purple-100';
      case 'legendary': return 'shadow-yellow-100';
      default: return 'shadow-gray-100';
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
      User, Palette, Trophy, Settings, Zap, Coins, Crown, Gem,
      Moon, Sparkles, Circle, Briefcase, Users, Heart, Shield,
      Edit, BarChart3, Headphones, Rocket
    };
    return iconMap[iconName] || User;
  };

  const triggerUnlockAnimation = (item: ShopItem, type: 'purchase' | 'unlock') => {
    setUnlockedItem(item);
    setShowUnlockPopup(true);
  };

  const handleItemClick = (item: ShopItem) => {
    if (item.status === 'coming_soon') {
      toast.info('Coming Soon!', {
        description: 'This item will be available in a future update.',
      });
      return;
    }

    if (!checkItemUnlocked(item)) {
      toast.error('Requirements Not Met', {
        description: 'You need to meet the unlock requirements first.',
      });
      return;
    }

    if (userOwnsItem(item.id)) {
      // Item is owned, try to equip it
      const success = equipItem(item.id);
      if (success) {
        loadUserData();
        toast.success('Item Equipped!', {
          description: `${item.name} has been equipped.`,
        });
      }
      return;
    }

    setSelectedItem(item);
    setShowPurchaseDialog(true);
  };

  const handlePurchase = () => {
    if (!selectedItem) return;

    const result = purchaseItem(selectedItem.id);
    
    if (result.success) {
      // Trigger unlock animation
      triggerUnlockAnimation(selectedItem, 'purchase');
      
      toast.success('Purchase Successful!', {
        description: result.message,
      });
      loadUserData();
      setShowPurchaseDialog(false);
      setSelectedItem(null);
    } else {
      if (result.message === 'Not enough coins') {
        setShowPurchaseDialog(false);
        setShowNotEnoughCoinsDialog(true);
      } else {
        toast.error('Purchase Failed', {
          description: result.message,
        });
      }
    }
  };

  const renderItemCard = (item: ShopItem) => {
    const isOwned = userOwnsItem(item.id);
    const isEquipped = equippedItems[item.category] === item.id;
    const isUnlocked = checkItemUnlocked(item);
    const IconComponent = getIconComponent(item.icon);
    const rarityGradient = getRarityGradient(item.rarity);
    const rarityGlow = getRarityGlow(item.rarity);

    return (
      <Card 
        key={item.id} 
        className={`shop-item-card group cursor-pointer bg-gradient-to-br ${rarityGradient} border-2 ${rarityGlow} ${
          isEquipped ? 'ring-2 ring-green-500 bg-green-50' : 
          isOwned ? 'ring-2 ring-blue-300 bg-blue-50' : 
          !isUnlocked ? 'opacity-60 grayscale' : ''
        } ${item.rarity === 'legendary' ? 'legendary' : ''} ${item.rarity === 'epic' ? 'epic' : ''}`}
        onClick={() => handleItemClick(item)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 ${
                item.rarity === 'legendary' ? 'animate-pulse' : ''
              }`}>
                <IconComponent className={`w-6 h-6 transition-colors duration-300 ${
                  item.rarity === 'common' ? 'text-gray-600' :
                  item.rarity === 'rare' ? 'text-blue-600' :
                  item.rarity === 'epic' ? 'text-purple-600' :
                  'text-yellow-600'
                }`} />
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-black transition-colors">
                  {item.name}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {getRarityIcon(item.rarity)}
                  <Badge 
                    variant="secondary" 
                    className={`font-semibold text-xs px-2 py-1 ${
                      item.rarity === 'common' ? 'bg-gray-200 text-gray-700' :
                      item.rarity === 'rare' ? 'bg-blue-200 text-blue-700' :
                      item.rarity === 'epic' ? 'bg-purple-200 text-purple-700' :
                      'bg-yellow-200 text-yellow-700'
                    }`}
                  >
                    {item.rarity.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xl font-bold text-gray-900">
                <Coins className="w-6 h-6 text-yellow-500" />
                {item.price}
              </div>
              {isOwned && (
                <div className="flex items-center gap-1 text-sm text-green-600 mt-1 font-medium">
                  {isEquipped ? (
                    <>
                      <Check className="w-4 h-4" />
                      Equipped
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Owned
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm mb-3 text-gray-600 leading-relaxed">
            {item.description}
          </CardDescription>
          
          {item.effects && (
            <div className="bg-white/60 backdrop-blur-sm p-3 rounded-lg text-xs text-gray-700 border border-white/50">
              <div className="flex items-center gap-1 mb-1">
                <Sparkle className="w-3 h-3 text-purple-500" />
                <strong>Effect:</strong>
              </div>
              {item.effects.description}
            </div>
          )}

          {!isUnlocked && item.unlockRequirement && (
            <div className="flex items-center gap-1 text-xs text-red-600 mt-2 font-medium">
              <Lock className="w-3 h-3" />
              Requirements not met
            </div>
          )}

          {item.status === 'coming_soon' && (
            <Badge variant="outline" className="mt-2 border-gray-300 text-gray-600 bg-white/50">
              <Rocket className="w-3 h-3 mr-1" />
              Coming Soon
            </Badge>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4">
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">Shop</h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600">Customize your experience and unlock premium features</p>
          </div>
          <div className="w-full sm:w-auto">
            <CoinDisplay variant="card" showAnimation={true} />
          </div>
        </div>
      </div>

      {/* Shop Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-6 sm:mb-8 bg-white border-gray-200 shadow-sm rounded-xl p-1 overflow-x-auto">
          {categories.map((category) => {
            const CategoryIcon = getIconComponent(category.icon);
            return (
              <TabsTrigger 
                key={category.id} 
                value={category.id} 
                className="shop-tab flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-black rounded-lg text-xs sm:text-sm"
              >
                <CategoryIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline font-medium">{category.name}</span>
              </TabsTrigger>
            );
          })}
          <TabsTrigger 
            value="coming-soon" 
            className="shop-tab flex items-center gap-1 sm:gap-2 data-[state=active]:bg-gray-100 data-[state=active]:text-black rounded-lg text-xs sm:text-sm"
          >
            <Rocket className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline font-medium">Coming Soon</span>
          </TabsTrigger>
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <div className="mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">{category.name}</h2>
              <p className="text-sm sm:text-base text-gray-600">{category.description}</p>
            </div>
            
            {category.items.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {category.items.map(renderItemCard)}
              </div>
            ) : (
              <Card className="border-gray-200 bg-white shadow-lg">
                <CardContent className="p-8 sm:p-12 text-center">
                  <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 text-black">No items available</h3>
                  <p className="text-sm sm:text-base text-gray-600">Check back later for new items!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}

        <TabsContent value="coming-soon">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">Coming Soon</h2>
            <p className="text-sm sm:text-base text-gray-600">Exciting new features and items coming in future updates</p>
          </div>
          
          {comingSoonItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {comingSoonItems.map(renderItemCard)}
            </div>
          ) : (
            <Card className="border-gray-200 bg-white shadow-lg">
              <CardContent className="p-8 sm:p-12 text-center">
                <Star className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-black">Stay tuned!</h3>
                <p className="text-sm sm:text-base text-gray-600">More exciting items are being developed.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Purchase Confirmation Dialog */}
      <Dialog open={showPurchaseDialog} onOpenChange={setShowPurchaseDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm Purchase</DialogTitle>
            <DialogDescription>
              Are you sure you want to purchase this item?
            </DialogDescription>
          </DialogHeader>
          
          {selectedItem && (
            <div className="py-4">
              <Card className="border-gray-200 bg-white shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center shadow-lg">
                      {(() => {
                        const IconComponent = getIconComponent(selectedItem.icon);
                        return <IconComponent className="w-8 h-8 text-gray-600" />;
                      })()}
                    </div>
                    <div>
                      <h3 className="font-bold text-black text-lg">{selectedItem.name}</h3>
                      <p className="text-sm text-gray-600">{selectedItem.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Coins className="w-6 h-6 text-yellow-500" />
                      <span className="text-2xl font-bold text-black">{selectedItem.price}</span>
                    </div>
                    <Badge className={`px-3 py-1 font-semibold ${
                      selectedItem.rarity === 'common' ? 'bg-gray-200 text-gray-700' :
                      selectedItem.rarity === 'rare' ? 'bg-blue-200 text-blue-700' :
                      selectedItem.rarity === 'epic' ? 'bg-purple-200 text-purple-700' :
                      'bg-yellow-200 text-yellow-700'
                    }`}>
                      {selectedItem.rarity.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowPurchaseDialog(false)} 
              className="shop-button border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePurchase} 
              className="shop-button bg-black hover:bg-gray-800 text-white px-6"
            >
              Purchase
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unlock Animation */}
      {unlockedItem && (
        <UnlockAnimation
          item={unlockedItem}
          isVisible={showUnlockPopup}
          onComplete={() => {
            setShowUnlockPopup(false);
            setUnlockedItem(null);
          }}
        />
      )}

      {/* Not Enough Coins Dialog */}
      <Dialog open={showNotEnoughCoinsDialog} onOpenChange={setShowNotEnoughCoinsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Not Enough Coins</DialogTitle>
            <DialogDescription>
              You need more coins to purchase this item.
            </DialogDescription>
          </DialogHeader>
          
          <Alert className="border-gray-200 bg-gray-50">
            <Coins className="h-4 w-4" />
            <AlertDescription className="text-gray-700">
              <strong>Ways to earn coins:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Play games: 10 coins per game</li>
                <li>• Correct answers: 2 coins each</li>
                <li>• Complete daily tasks: 25-100 coins</li>
                <li>• Unlock achievements: 50-500 coins</li>
                <li>• Share scores: 50 coins per share</li>
                <li>• Follow social media: 25 coins per platform</li>
              </ul>
            </AlertDescription>
          </Alert>

          <DialogFooter className="gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowNotEnoughCoinsDialog(false)} 
              className="shop-button border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setShowNotEnoughCoinsDialog(false);
                // Navigate to daily tasks or game
              }} 
              className="shop-button bg-black hover:bg-gray-800 text-white px-6"
            >
              Start Earning Coins
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shop;