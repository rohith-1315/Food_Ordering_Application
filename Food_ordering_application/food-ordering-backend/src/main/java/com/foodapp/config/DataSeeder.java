package com.foodapp.config;

import com.foodapp.model.MenuItem;
import com.foodapp.model.Restaurant;
import com.foodapp.repository.MenuItemRepository;
import com.foodapp.repository.RestaurantRepository;
import java.util.ArrayList;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public void run(String... args) {
        log.info("[Seeder] Syncing restaurant and menu seed data...");

        List<RestaurantSeed> seeds = List.of(
            new RestaurantSeed(
                "Spice Garden",
                "12 MG Road, Vijayawada",
                "Indian",
                "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
                List.of(
                    menu("Butter Chicken", "Creamy tomato-based curry with tender chicken", "280", "Main Course"),
                    menu("Paneer Tikka", "Grilled cottage cheese with spices", "220", "Starters"),
                    menu("Dal Makhani", "Slow-cooked black lentils in butter and cream", "180", "Main Course"),
                    menu("Garlic Naan", "Soft bread baked in tandoor with garlic butter", "60", "Breads"),
                    menu("Chicken Biryani", "Aromatic basmati rice with spiced chicken", "320", "Rice"),
                    menu("Mango Lassi", "Chilled yogurt drink with fresh mango pulp", "80", "Drinks")
                )),
            new RestaurantSeed(
                "Dragon Wok",
                "45 Eluru Road, Vijayawada",
                "Chinese",
                "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400",
                List.of(
                    menu("Kung Pao Chicken", "Spicy stir-fried chicken with peanuts", "260", "Main Course"),
                    menu("Veg Fried Rice", "Wok-tossed rice with fresh vegetables", "180", "Rice"),
                    menu("Chicken Manchurian", "Crispy chicken in tangy sauce", "240", "Starters"),
                    menu("Hakka Noodles", "Stir-fried noodles with vegetables and soy", "160", "Noodles"),
                    menu("Spring Rolls", "Crispy rolls stuffed with vegetables", "140", "Starters"),
                    menu("Lemon Iced Tea", "Refreshing chilled tea with lemon", "80", "Drinks")
                )),
            new RestaurantSeed(
                "Pizza Plaza",
                "78 Benz Circle, Vijayawada",
                "Italian",
                "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
                List.of(
                    menu("Margherita Pizza", "Classic tomato, mozzarella and basil", "250", "Pizza"),
                    menu("Pepperoni Pizza", "Loaded with pepperoni and mozzarella", "320", "Pizza"),
                    menu("BBQ Chicken Pizza", "Smoky BBQ sauce with grilled chicken", "340", "Pizza"),
                    menu("Pasta Arrabbiata", "Penne in spicy tomato sauce", "200", "Pasta"),
                    menu("Garlic Bread", "Toasted bread with herb garlic butter", "100", "Sides"),
                    menu("Tiramisu", "Classic Italian coffee dessert", "150", "Desserts")
                )),
            new RestaurantSeed(
                "Burger Barn",
                "23 Auto Nagar, Vijayawada",
                "American",
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
                List.of(
                    menu("Classic Beef Burger", "Juicy beef patty with lettuce and cheese", "220", "Burgers"),
                    menu("Chicken Crispy Burger", "Crispy fried chicken with slaw", "200", "Burgers"),
                    menu("Veggie Burger", "Grilled veggie patty with avocado", "160", "Burgers"),
                    menu("Loaded Fries", "Fries topped with cheese sauce and jalapenos", "140", "Sides"),
                    menu("Onion Rings", "Golden crispy battered onion rings", "100", "Sides"),
                    menu("Chocolate Milkshake", "Thick creamy chocolate shake", "120", "Drinks")
                )),
            new RestaurantSeed(
                "South Spice",
                "56 Patamata, Vijayawada",
                "South Indian",
                "https://images.unsplash.com/photo-1630851840633-f96999247032?w=400",
                List.of(
                    menu("Masala Dosa", "Crispy crepe filled with spiced potato", "120", "Breakfast"),
                    menu("Idli Sambar", "Steamed rice cakes with lentil soup", "80", "Breakfast"),
                    menu("Pesarattu", "Green gram crepe", "100", "Breakfast"),
                    menu("Vada Sambar", "Crispy lentil donuts with sambar", "90", "Breakfast"),
                    menu("Hyderabadi Biryani", "Dum-cooked rice with aromatic spices", "280", "Rice"),
                    menu("Filter Coffee", "Strong South Indian coffee", "50", "Drinks")
                )),
            new RestaurantSeed(
                "Coastal Catch",
                "11 Beach Road, Visakhapatnam",
                "Seafood",
                "https://images.unsplash.com/photo-1544943910-4c1dc44aab44?w=400",
                List.of(
                    menu("Andhra Fish Curry", "Spicy fish curry with coastal masala", "320", "Main Course"),
                    menu("Prawn Fry", "Crispy pan-fried prawns", "360", "Starters"),
                    menu("Crab Masala", "Rich crab masala in onion gravy", "420", "Main Course"),
                    menu("Fish Pulusu", "Tangy tamarind fish stew", "300", "Main Course"),
                    menu("Steamed Rice", "Freshly steamed rice", "70", "Rice"),
                    menu("Lime Soda", "Chilled sweet and salt soda", "60", "Drinks")
                )),
            new RestaurantSeed(
                "Nawabi Grill",
                "89 Moghalrajpuram, Vijayawada",
                "Mughlai",
                "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400",
                List.of(
                    menu("Mutton Rogan Josh", "Slow-cooked mutton in rich gravy", "380", "Main Course"),
                    menu("Chicken Korma", "Creamy cashew and onion curry", "320", "Main Course"),
                    menu("Seekh Kebab", "Char-grilled minced kebabs", "250", "Starters"),
                    menu("Rumali Roti", "Soft thin hand-tossed roti", "40", "Breads"),
                    menu("Mughlai Biryani", "Fragrant rice layered with spices", "350", "Rice"),
                    menu("Shahi Tukda", "Royal bread pudding dessert", "120", "Desserts")
                )),
            new RestaurantSeed(
                "Tokyo Bento",
                "7 IT Park Road, Vijayawada",
                "Japanese",
                "https://images.unsplash.com/photo-1553621042-f6e147245754?w=400",
                List.of(
                    menu("Chicken Teriyaki", "Grilled chicken with teriyaki glaze", "330", "Main Course"),
                    menu("Katsu Curry", "Breaded cutlet with Japanese curry", "320", "Main Course"),
                    menu("Veg Sushi Roll", "Cucumber and avocado sushi", "220", "Sushi"),
                    menu("Ramen Bowl", "Noodles in savory broth", "260", "Noodles"),
                    menu("Tempura Veg", "Crispy battered vegetables", "190", "Starters"),
                    menu("Matcha Latte", "Green tea milk drink", "140", "Drinks")
                )),
            new RestaurantSeed(
                "Seoul Kitchen",
                "34 Governorpet, Vijayawada",
                "Korean",
                "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400",
                List.of(
                    menu("Bibimbap", "Rice bowl with vegetables and sauce", "280", "Main Course"),
                    menu("Kimchi Fried Rice", "Spicy rice stir-fried with kimchi", "240", "Rice"),
                    menu("Korean Fried Chicken", "Double-fried chicken bites", "320", "Starters"),
                    menu("Tteokbokki", "Spicy rice cakes in sauce", "230", "Snacks"),
                    menu("Japchae", "Sweet potato glass noodles", "250", "Noodles"),
                    menu("Yuzu Cooler", "Citrus sparkling cooler", "110", "Drinks")
                )),
            new RestaurantSeed(
                "Taco Fiesta",
                "28 Bandar Road, Vijayawada",
                "Mexican",
                "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400",
                List.of(
                    menu("Chicken Tacos", "Soft tortillas with spicy chicken", "220", "Tacos"),
                    menu("Veg Burrito", "Loaded burrito with beans and rice", "240", "Wraps"),
                    menu("Nachos Supreme", "Nachos with salsa and cheese", "180", "Starters"),
                    menu("Quesadilla", "Cheesy tortilla grilled golden", "210", "Snacks"),
                    menu("Mexican Rice", "Spiced tomato rice", "170", "Rice"),
                    menu("Churros", "Cinnamon sugar fried dessert", "130", "Desserts")
                )),
            new RestaurantSeed(
                "Mediterranean Bowl",
                "13 Labbipet, Vijayawada",
                "Mediterranean",
                "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
                List.of(
                    menu("Chicken Shawarma Bowl", "Grilled chicken with hummus and rice", "290", "Main Course"),
                    menu("Falafel Plate", "Crispy falafel with tahini dip", "220", "Starters"),
                    menu("Greek Salad", "Fresh salad with feta and olives", "190", "Salads"),
                    menu("Pita and Hummus", "Warm pita served with hummus", "150", "Sides"),
                    menu("Lemon Herb Rice", "Fragrant herb rice", "130", "Rice"),
                    menu("Baklava", "Layered nut pastry with honey", "140", "Desserts")
                )),
            new RestaurantSeed(
                "Cafe Brew and Bite",
                "6 Benz Circle, Vijayawada",
                "Cafe",
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
                List.of(
                    menu("Club Sandwich", "Triple layered grilled sandwich", "180", "Snacks"),
                    menu("Penne Alfredo", "Creamy white sauce pasta", "240", "Pasta"),
                    menu("Crispy Fries", "Classic salted fries", "120", "Sides"),
                    menu("Cold Coffee", "Iced coffee with foam", "130", "Drinks"),
                    menu("Blueberry Muffin", "Soft muffin with berries", "95", "Bakery"),
                    menu("Cheese Toast", "Toasted bread with melted cheese", "140", "Snacks")
                )),
            new RestaurantSeed(
                "Sweet Crumbs Bakery",
                "91 One Town, Vijayawada",
                "Bakery",
                "https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=400",
                List.of(
                    menu("Choco Truffle Slice", "Rich chocolate truffle pastry", "110", "Desserts"),
                    menu("Butterscotch Pastry", "Creamy butterscotch cake slice", "100", "Desserts"),
                    menu("Veg Puff", "Flaky pastry with veg stuffing", "45", "Snacks"),
                    menu("Paneer Roll", "Savory paneer stuffed roll", "70", "Snacks"),
                    menu("Croissant", "Buttery baked croissant", "90", "Bakery"),
                    menu("Hot Chocolate", "Creamy hot chocolate cup", "130", "Drinks")
                )),
            new RestaurantSeed(
                "Punjabi Dhaba",
                "102 NH Service Road, Vijayawada",
                "North Indian",
                "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400",
                List.of(
                    menu("Chole Bhature", "Spiced chickpeas with fried bread", "180", "Main Course"),
                    menu("Amritsari Kulcha", "Stuffed kulcha with chole", "170", "Breads"),
                    menu("Paneer Butter Masala", "Creamy paneer tomato gravy", "250", "Main Course"),
                    menu("Jeera Rice", "Cumin flavored basmati rice", "130", "Rice"),
                    menu("Lassi", "Traditional sweet yogurt drink", "80", "Drinks"),
                    menu("Gajar Halwa", "Warm carrot dessert", "120", "Desserts")
                )),
            new RestaurantSeed(
                "Kebab Corner",
                "48 Satyanarayanapuram, Vijayawada",
                "Middle Eastern",
                "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=400",
                List.of(
                    menu("Chicken Shawarma Wrap", "Juicy shawarma in pita wrap", "210", "Wraps"),
                    menu("Lamb Kebab Platter", "Grilled lamb kebabs with dip", "340", "Main Course"),
                    menu("Hummus Bowl", "Creamy hummus with olive oil", "150", "Starters"),
                    menu("Fattoush Salad", "Fresh salad with toasted pita", "170", "Salads"),
                    menu("Garlic Rice", "Fragrant rice with garlic", "140", "Rice"),
                    menu("Mint Lemonade", "Fresh mint citrus cooler", "90", "Drinks")
                )),
            new RestaurantSeed(
                "Green Vegan Hub",
                "17 Currency Nagar, Vijayawada",
                "Vegan",
                "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400",
                List.of(
                    menu("Tofu Stir Fry", "Tofu tossed with veggies", "220", "Main Course"),
                    menu("Vegan Buddha Bowl", "Quinoa bowl with chickpeas", "240", "Bowls"),
                    menu("Hummus Toast", "Multigrain toast with hummus", "150", "Snacks"),
                    menu("Vegan Burger", "Plant-based patty burger", "210", "Burgers"),
                    menu("Detox Salad", "Leafy greens and seeds", "180", "Salads"),
                    menu("Almond Smoothie", "Dairy-free nut smoothie", "140", "Drinks")
                )),
            new RestaurantSeed(
                "Street Chaat Junction",
                "64 Besant Road, Vijayawada",
                "Street Food",
                "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400",
                List.of(
                    menu("Pani Puri", "Crispy puri with tangy water", "70", "Chaat"),
                    menu("Dahi Puri", "Puri topped with curd and chutney", "90", "Chaat"),
                    menu("Bhel Puri", "Puffed rice and masala mix", "80", "Chaat"),
                    menu("Pav Bhaji", "Spiced mash with butter pav", "140", "Main Course"),
                    menu("Sev Puri", "Crispy puri with sev topping", "85", "Chaat"),
                    menu("Masala Soda", "Sparkling masala soda", "60", "Drinks")
                )),
            new RestaurantSeed(
                "Rice and Ramen House",
                "53 Ring Road, Vijayawada",
                "Asian Fusion",
                "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400",
                List.of(
                    menu("Chicken Ramen", "Noodle soup with chicken", "290", "Noodles"),
                    menu("Veg Ramen", "Noodle soup with vegetables", "250", "Noodles"),
                    menu("Teriyaki Rice Bowl", "Rice bowl with teriyaki glaze", "260", "Rice"),
                    menu("Spicy Udon", "Thick noodles in spicy sauce", "240", "Noodles"),
                    menu("Miso Soup", "Traditional Japanese soup", "130", "Soups"),
                    menu("Iced Matcha", "Chilled matcha tea", "120", "Drinks")
                )),
            new RestaurantSeed(
                "Royal Biryani Pot",
                "88 Gunadala, Vijayawada",
                "Hyderabadi",
                "https://images.unsplash.com/photo-1563379091339-03246963d96c?w=400",
                List.of(
                    menu("Chicken Dum Biryani", "Slow-cooked dum style biryani", "320", "Rice"),
                    menu("Mutton Dum Biryani", "Classic mutton dum biryani", "390", "Rice"),
                    menu("Paneer Biryani", "Aromatic biryani with paneer", "280", "Rice"),
                    menu("Mirchi Ka Salan", "Traditional peanut curry", "120", "Sides"),
                    menu("Raita", "Cool yogurt onion mix", "60", "Sides"),
                    menu("Double Ka Meetha", "Hyderabadi bread dessert", "130", "Desserts")
                )),
            new RestaurantSeed(
                "Healthy Salad Co",
                "29 Patamata Lane, Vijayawada",
                "Healthy",
                "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400",
                List.of(
                    menu("Grilled Chicken Salad", "High-protein mixed salad", "240", "Salads"),
                    menu("Quinoa Veg Bowl", "Quinoa with roasted vegetables", "230", "Bowls"),
                    menu("Avocado Toast", "Sourdough topped with avocado", "180", "Snacks"),
                    menu("Fruit Yogurt Bowl", "Seasonal fruits with yogurt", "170", "Bowls"),
                    menu("Protein Smoothie", "Banana and peanut smoothie", "150", "Drinks"),
                    menu("Oats Pancake", "Healthy oats pancake stack", "190", "Breakfast")
                ))
        );

        int restaurantsAdded = 0;
        int menuItemsAdded = 0;

        for (RestaurantSeed seed : seeds) {
            SeedResult result = seedRestaurant(seed);
            restaurantsAdded += result.restaurantsAdded();
            menuItemsAdded += result.menuItemsAdded();
        }

        log.info(
            "[Seeder] Sync complete. Restaurants in DB: {}, added restaurants: {}, added menu items: {}",
            restaurantRepository.count(),
            restaurantsAdded,
            menuItemsAdded);
    }

    private SeedResult seedRestaurant(RestaurantSeed seed) {
        Restaurant restaurant = restaurantRepository.findByNameIgnoreCase(seed.name()).orElse(null);
        boolean createdRestaurant = restaurant == null;

        if (restaurant == null) {
            restaurant = new Restaurant();
        }

        restaurant.setName(seed.name());
        restaurant.setAddress(seed.address());
        restaurant.setCuisineType(seed.cuisineType());
        restaurant.setImageUrl(seed.imageUrl());
        restaurant = restaurantRepository.save(restaurant);

        Set<String> existingMenuNames = new HashSet<>();
        for (MenuItem existing : menuItemRepository.findByRestaurantId(restaurant.getId())) {
            if (existing.getName() != null) {
                existingMenuNames.add(existing.getName().trim().toLowerCase(Locale.ROOT));
            }
        }

        List<MenuItem> newItems = new ArrayList<>();
        for (MenuSeed menuSeed : seed.menuItems()) {
            String key = menuSeed.name().trim().toLowerCase(Locale.ROOT);
            if (!existingMenuNames.contains(key)) {
                newItems.add(item(menuSeed.name(), menuSeed.desc(), menuSeed.price(), menuSeed.category(), restaurant));
            }
        }

        if (!newItems.isEmpty()) {
            menuItemRepository.saveAll(newItems);
        }

        List<MenuItem> allMenuItems = menuItemRepository.findByRestaurantId(restaurant.getId());
        if (!allMenuItems.isEmpty()) {
            BigDecimal total = allMenuItems.stream()
                .map(MenuItem::getPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal avgPrice = total.divide(BigDecimal.valueOf(allMenuItems.size()), 2, RoundingMode.HALF_UP);
            restaurant.setAvgPrice(avgPrice);
        }

        if (restaurant.getAvgRating() == null) {
            restaurant.setAvgRating(0.0);
        }

        if (restaurant.getOrderCount() == null) {
            restaurant.setOrderCount(0L);
        }

        restaurantRepository.save(restaurant);

        log.info(
            "[Seeder] {} | menu added: {}",
            seed.name(),
            newItems.size());

        return new SeedResult(createdRestaurant ? 1 : 0, newItems.size());
    }

    private MenuSeed menu(String name, String desc, String price, String category) {
        return new MenuSeed(name, desc, new BigDecimal(price), category);
    }

    private MenuItem item(String name, String desc, BigDecimal price, String category, Restaurant restaurant) {
        MenuItem menuItem = new MenuItem();
        menuItem.setName(name);
        menuItem.setDescription(desc);
        menuItem.setPrice(price);
        menuItem.setCategory(category);
        menuItem.setAvailable(true);
        menuItem.setRestaurant(restaurant);
        return menuItem;
    }

    private record MenuSeed(String name, String desc, BigDecimal price, String category) {
    }

    private record RestaurantSeed(
        String name,
        String address,
        String cuisineType,
        String imageUrl,
        List<MenuSeed> menuItems) {
    }

    private record SeedResult(int restaurantsAdded, int menuItemsAdded) {
    }
}