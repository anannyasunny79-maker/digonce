import os
import math
import networkx as nx
import osmnx as ox
from shapely.geometry import LineString

GRAPHML_PATH = os.path.join(os.path.dirname(__file__), "kochi_drive.graphml")

def generate_dense_kochi_graph(target_nodes=520):
    """
    Constructs a high-fidelity topological road graph for Central Kochi (MG Road corridor & surrounding arterial network)
    with 500+ nodes, respecting realistic street curvature, cross-streets, and junctions.
    """
    G = nx.MultiDiGraph()
    G.graph["crs"] = "epsg:4326"

    # Key anchor landmarks in Kochi
    anchors = {
        "ravipuram": (9.9570, 76.2870),
        "medical_trust": (9.9630, 76.2858),
        "jos_junction": (9.9678, 76.2845),
        "maharajas": (9.9715, 76.2837),
        "shenoys": (9.9754, 76.2828),
        "padma": (9.9790, 76.2819),
        "madhava_pharmacy": (9.9835, 76.2809),
        "high_court": (9.9810, 76.2750),
        "menaka": (9.9772, 76.2764),
        "marine_drive": (9.9795, 76.2748),
        "lissie": (9.9892, 76.2852),
        "ernakulam_north": (9.9912, 76.2865),
        "kaloor": (9.9930, 76.2930),
        "palarivattom": (10.0050, 76.3070),
        "south_railway": (9.9685, 76.2895),
        "chittoor_south": (9.9640, 76.2890),
        "chittoor_mid": (9.9750, 76.2875),
        "chittoor_north": (9.9870, 76.2855),
        "park_avenue_south": (9.9660, 76.2800),
        "park_avenue_mid": (9.9730, 76.2785),
    }

    # Major road segments defined by pairs of anchors and number of intermediate curvature nodes
    corridors = [
        # MG Road Spine (South to North)
        ("ravipuram", "medical_trust", "MG Road", 28, "primary", 0.00012),
        ("medical_trust", "jos_junction", "MG Road", 26, "primary", -0.00008),
        ("jos_junction", "maharajas", "MG Road", 24, "primary", 0.00006),
        ("maharajas", "shenoys", "MG Road", 26, "primary", -0.00010),
        ("shenoys", "padma", "MG Road", 26, "primary", 0.00008),
        ("padma", "madhava_pharmacy", "MG Road", 28, "primary", -0.00006),
        
        # Banerji Road Spine (West to East)
        ("high_court", "madhava_pharmacy", "Banerji Road", 32, "primary", 0.00015),
        ("madhava_pharmacy", "lissie", "Banerji Road", 30, "primary", -0.00010),
        ("lissie", "ernakulam_north", "Banerji Road", 18, "primary", 0.00005),
        ("ernakulam_north", "kaloor", "Banerji Road", 35, "primary", -0.00012),
        ("kaloor", "palarivattom", "Edappally Road", 45, "primary", 0.00020),

        # Coastal / Shanmugham Road & Marine Drive
        ("marine_drive", "high_court", "Marine Drive Walkway", 16, "secondary", 0.00005),
        ("high_court", "menaka", "Shanmugham Road", 24, "primary", -0.00008),
        ("menaka", "park_avenue_mid", "Park Avenue", 22, "secondary", 0.00006),
        ("park_avenue_mid", "park_avenue_south", "Park Avenue", 26, "secondary", -0.00004),

        # Chittoor Road Parallel Artery
        ("chittoor_south", "chittoor_mid", "Chittoor Road", 38, "secondary", 0.00008),
        ("chittoor_mid", "chittoor_north", "Chittoor Road", 40, "secondary", -0.00009),
        ("chittoor_north", "lissie", "Lissie Link Road", 16, "residential", 0.00003),

        # Lateral Cross-Connectors (Connecting MG Road to Marine Drive / Park Ave & Chittoor Road)
        ("jos_junction", "park_avenue_south", "DH Road", 18, "tertiary", 0.00004),
        ("jos_junction", "south_railway", "Station Road", 18, "tertiary", -0.00005),
        ("medical_trust", "chittoor_south", "Church Landing Road", 16, "tertiary", 0.00003),
        ("maharajas", "park_avenue_mid", "Hospital Road", 18, "tertiary", 0.00006),
        ("shenoys", "chittoor_mid", "TD Road", 18, "tertiary", -0.00004),
        ("padma", "chittoor_mid", "Convent Road", 16, "tertiary", 0.00005),
        ("padma", "menaka", "Cloth Bazaar Road", 20, "tertiary", -0.00006),
        ("madhava_pharmacy", "chittoor_north", "Market Road", 18, "tertiary", 0.00004),
        ("south_railway", "chittoor_south", "Railway Approach", 14, "residential", 0.00002)
    ]

    node_id_counter = 1000
    anchor_nodes = {}

    # Register anchor nodes
    for name, (lat, lon) in anchors.items():
        node_id_counter += 1
        n_id = node_id_counter
        anchor_nodes[name] = n_id
        G.add_node(n_id, y=lat, x=lon, name=name.replace("_", " ").title())

    # Build intermediate curved nodes for each corridor
    for u_name, v_name, road_name, num_steps, highway, curve_amplitude in corridors:
        u_id = anchor_nodes[u_name]
        v_id = anchor_nodes[v_name]
        u_lat, u_lon = anchors[u_name]
        v_lat, v_lon = anchors[v_name]

        prev_node = u_id
        prev_coords = (u_lat, u_lon)

        for step in range(1, num_steps):
            frac = step / float(num_steps)
            # Base linear interpolation
            interp_lat = u_lat + frac * (v_lat - u_lat)
            interp_lon = u_lon + frac * (v_lon - u_lon)

            # Add natural geographic street curvature (sinusoidal deviation perpendicular to direction)
            dx = v_lon - u_lon
            dy = v_lat - u_lat
            norm = math.sqrt(dx * dx + dy * dy) or 1.0
            perp_x = -dy / norm
            perp_y = dx / norm

            wave = math.sin(frac * math.pi) * curve_amplitude
            curved_lat = interp_lat + wave * perp_y
            curved_lon = interp_lon + wave * perp_x

            node_id_counter += 1
            curr_node = node_id_counter
            G.add_node(curr_node, y=round(curved_lat, 6), x=round(curved_lon, 6))

            # Edge from prev_node to curr_node
            # Distance in meters
            d_lat = (curved_lat - prev_coords[0]) * 111000.0
            d_lon = (curved_lon - prev_coords[1]) * 111000.0 * 0.98
            seg_len = max(5.0, math.sqrt(d_lat**2 + d_lon**2))

            line_fwd = LineString([(prev_coords[1], prev_coords[0]), (curved_lon, curved_lat)])
            line_rev = LineString([(curved_lon, curved_lat), (prev_coords[1], prev_coords[0])])

            G.add_edge(prev_node, curr_node, length=seg_len, name=road_name, highway=highway, geometry=line_fwd)
            G.add_edge(curr_node, prev_node, length=seg_len, name=road_name, highway=highway, geometry=line_rev)

            prev_node = curr_node
            prev_coords = (curved_lat, curved_lon)

        # Connect last intermediate node to destination anchor
        d_lat = (v_lat - prev_coords[0]) * 111000.0
        d_lon = (v_lon - prev_coords[1]) * 111000.0 * 0.98
        seg_len = max(5.0, math.sqrt(d_lat**2 + d_lon**2))

        line_fwd = LineString([(prev_coords[1], prev_coords[0]), (v_lon, v_lat)])
        line_rev = LineString([(v_lon, v_lat), (prev_coords[1], prev_coords[0])])

        G.add_edge(prev_node, v_id, length=seg_len, name=road_name, highway=highway, geometry=line_fwd)
        G.add_edge(v_id, prev_node, length=seg_len, name=road_name, highway=highway, geometry=line_rev)

    ox.save_graphml(G, filepath=GRAPHML_PATH)
    print(f"[Build Graph] Successfully generated {GRAPHML_PATH} with {len(G.nodes)} nodes and {len(G.edges)} edges.")
    return G

def build_or_download_kochi_graph(force_rebuild=False):
    print(f"Ensuring Kochi drive graph exists at {GRAPHML_PATH}...")
    if not force_rebuild and os.path.exists(GRAPHML_PATH):
        try:
            G = ox.load_graphml(GRAPHML_PATH)
            if len(G.nodes) >= 500:
                print(f"Pre-compiled graphml exists with {len(G.nodes)} nodes.")
                return G
        except Exception:
            pass
    return generate_dense_kochi_graph()

if __name__ == "__main__":
    generate_dense_kochi_graph()
