import os
import requests
from typing import Tuple, Optional

LOCAL_GAZETTEER = {
    "jos junction": (9.9678, 76.2845),
    "shenoys junction": (9.9754, 76.2828),
    "padma junction": (9.9790, 76.2819),
    "madhava pharmacy junction": (9.9835, 76.2809),
    "kaloor junction": (9.9930, 76.2930),
    "edappally toll": (10.0240, 76.3080),
    "high court junction": (9.9810, 76.2750),
    "ernakulam north": (9.9912, 76.2865),
    # Additional Kochi arterial junctions for instant zero-latency match
    "ravipuram": (9.9570, 76.2870),
    "medical trust junction": (9.9630, 76.2858),
    "menaka": (9.9772, 76.2764),
    "marine drive": (9.9795, 76.2748),
    "palarivattom junction": (10.0050, 76.3070),
    "vyttila hub": (9.9673, 76.3195),
    "south railway station": (9.9685, 76.2895),
    "lissie junction": (9.9892, 76.2852)
}

def resolve_junction_coordinates(junction_name: str, custom_serp_key: Optional[str] = None) -> Tuple[float, float]:
    """
    Step 4: Resolve junction name to GPS coordinates (lat, lon).
    1. Primary: Local gazetteer dictionary lookup (0ms latency).
    2. Secondary fallback: SERP API Google Maps Search.
    3. Tertiary fallback: OpenStreetMap Nominatim for resilient live resolution.
    """
    if not junction_name:
        raise ValueError("Junction name cannot be empty")
        
    clean_name = junction_name.strip().lower()
    
    # 1. Exact match in local gazetteer
    if clean_name in LOCAL_GAZETTEER:
        return LOCAL_GAZETTEER[clean_name]
    
    # Fuzzy/substring match in local gazetteer
    for key, coords in LOCAL_GAZETTEER.items():
        if key in clean_name or clean_name in key:
            return coords

    # 2. Fallback using SERP API credits
    serp_api_key = custom_serp_key or os.getenv("SERPAPI_API_KEY")
    if serp_api_key:
        try:
            url = "https://serpapi.com/search.json"
            params = {
                "engine": "google_maps",
                "q": f"{junction_name}, Kochi, Kerala",
                "api_key": serp_api_key
            }
            response = requests.get(url, params=params, timeout=10).json()
            if "place_results" in response and "gps_coordinates" in response["place_results"]:
                coords = response["place_results"]["gps_coordinates"]
                return (coords["latitude"], coords["longitude"])
        except Exception as e:
            print(f"[Warning] SERP API lookup failed for {junction_name}: {e}")

    # 3. Tertiary fallback: OpenStreetMap Nominatim
    try:
        nom_url = "https://nominatim.openstreetmap.org/search"
        headers = {"User-Agent": "DigOnce-Municipal-Ingestion/1.0 (municipal.infra@kochi.gov.in)"}
        params = {"q": f"{junction_name}, Kochi, Kerala, India", "format": "json", "limit": 1}
        resp = requests.get(nom_url, params=params, headers=headers, timeout=5)
        if resp.status_code == 200:
            data = resp.json()
            if data and len(data) > 0:
                return (float(data[0]["lat"]), float(data[0]["lon"]))
    except Exception as e:
        print(f"[Warning] Nominatim lookup fallback failed for {junction_name}: {e}")

    # Central fallback if completely unknown
    raise ValueError(f"Could not resolve junction coordinates: {junction_name}")
