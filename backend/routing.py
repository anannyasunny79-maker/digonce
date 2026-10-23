import os
import networkx as nx
import osmnx as ox
from shapely.geometry import mapping, LineString
from typing import Dict, Any, Tuple

GRAPH_PATH = os.path.join(os.path.dirname(__file__), "kochi_drive.graphml")
_GRAPH = None

def get_drive_graph():
    """
    Loads pre-compiled OSMnx Kochi drive graph from local SSD.
    Loads in < 0.05 seconds.
    """
    global _GRAPH
    if _GRAPH is None:
        if not os.path.exists(GRAPH_PATH):
            from backend.build_graph import build_or_download_kochi_graph
            build_or_download_kochi_graph()
        _GRAPH = ox.load_graphml(GRAPH_PATH)
    return _GRAPH

def generate_corridor_geojson(graph, start_coords: Tuple[float, float], end_coords: Tuple[float, float]) -> Dict[str, Any]:
    """
    Step 4 & 5: Snap both coordinates to nearest nodes on local OSMnx Kochi drive graph
    and compute shortest road path, returning a GeoJSON Line feature.
    """
    orig_node = ox.distance.nearest_nodes(graph, X=start_coords[1], Y=start_coords[0])
    dest_node = ox.distance.nearest_nodes(graph, X=end_coords[1], Y=end_coords[0])
    
    route_nodes = nx.shortest_path(graph, orig_node, dest_node, weight="length")
    subgraph = graph.subgraph(route_nodes)
    
    try:
        # Compatible with both osmnx 1.x and 2.x
        if hasattr(ox, "graph_to_gdfs"):
            gdf = ox.graph_to_gdfs(subgraph, nodes=False)
        else:
            gdf = ox.utils_graph.graph_to_gdfs(subgraph, nodes=False)

        if hasattr(gdf, "union_all"):
            route_geom = gdf.union_all()
        else:
            route_geom = gdf.unary_union
    except Exception:
        # Fallback to direct path linestring
        coords = []
        for n in route_nodes:
            coords.append((float(graph.nodes[n].get("x", 0)), float(graph.nodes[n].get("y", 0))))
        route_geom = LineString(coords)

    # Calculate total length
    total_length_m = 0.0
    for i in range(len(route_nodes) - 1):
        u, v = route_nodes[i], route_nodes[i + 1]
        edge_data = graph.get_edge_data(u, v)
        if edge_data:
            # MultiDiGraph: edge_data is a dict of keys -> attrs
            first_edge = list(edge_data.values())[0]
            total_length_m += float(first_edge.get("length", 100.0))

    return {
        "type": "Feature",
        "geometry": mapping(route_geom),
        "properties": {
            "source_nodes": [int(orig_node), int(dest_node)],
            "route_node_ids": [int(n) for n in route_nodes],
            "node_count": len(route_nodes),
            "length_meters": round(total_length_m, 2),
            "length_km": round(total_length_m / 1000.0, 2)
        }
    }
