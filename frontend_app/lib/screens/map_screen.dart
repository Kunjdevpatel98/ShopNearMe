import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import '../providers/shop_provider.dart';
import 'shop_detail_screen.dart';
import '../utils/style_constants.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> {
  @override
  Widget build(BuildContext context) {
    final shopProvider = Provider.of<ShopProvider>(context);
    final userPos = shopProvider.userPosition;

    if (userPos == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.location_off, size: 60, color: Colors.grey),
              const SizedBox(height: 16),
              Text(
                shopProvider.locationError ?? "Getting your location...",
                style: const TextStyle(color: Colors.grey),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => shopProvider.fetchShops(),
                child: const Text("Retry"),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      body: Stack(
        children: [
          /// MAP
          GoogleMap(
            initialCameraPosition: CameraPosition(
              target: LatLng(userPos.latitude, userPos.longitude),
              zoom: 15,
            ),

            myLocationEnabled: true,

            markers: shopProvider.shops
                .where((s) => s.latitude != 0.0 && s.longitude != 0.0)
                .map(
                  (shop) => Marker(
                    markerId: MarkerId(shop.id.toString()),
                    position: LatLng(shop.latitude, shop.longitude),

                    infoWindow: InfoWindow(
                      title: shop.name,
                      snippet:
                          '${shop.distance != null ? (shop.distance! / 1000).toStringAsFixed(1) : "0"} km away',

                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ShopDetailScreen(shop: shop),
                          ),
                        );
                      },
                    ),
                  ),
                )
                .toSet(),
          ),

          /// TOP SEARCH BAR (Rapido style)
          Positioned(
            top: 50,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              height: 52,
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    blurRadius: 15,
                    color: Colors.black.withOpacity(.15),
                  ),
                ],
              ),
              child: Row(
                children: const [
                  Icon(Icons.search, color: Colors.grey),
                  SizedBox(width: 10),
                  Text(
                    "Search nearby shops...",
                    style: TextStyle(color: Colors.grey),
                  ),
                ],
              ),
            ),
          ),

          /// FLOATING LOCATION BUTTON
          Positioned(
            bottom: 140,
            right: 16,
            child: FloatingActionButton(
              backgroundColor: Colors.white,
              onPressed: () => shopProvider.fetchShops(),
              child: const Icon(Icons.my_location, color: Colors.black),
            ),
          ),

          /// BOTTOM SHOP CARD
          if (shopProvider.shops.isNotEmpty)
            Positioned(
              bottom: 20,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.all(16),

                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      blurRadius: 20,
                      color: Colors.black.withOpacity(.15),
                    ),
                  ],
                ),

                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,

                  children: [
                    Text(
                      shopProvider.shops.first.name,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 4),

                    Text(
                      "${(shopProvider.shops.first.distance ?? 0) / 1000} km away",
                      style: const TextStyle(color: Colors.grey),
                    ),

                    const SizedBox(height: 10),

                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        minimumSize: const Size(double.infinity, 45),
                      ),

                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => ShopDetailScreen(
                              shop: shopProvider.shops.first,
                            ),
                          ),
                        );
                      },

                      child: const Text("View Shop"),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
