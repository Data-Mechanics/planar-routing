import json
import sys

from shapely.geometry import Polygon
import numpy as np
from scipy.spatial import ConvexHull
import scipy


def find_point(coords, point_list):
    """
    Coordinates represent either the source or destination [x,y] coordinates of a line.
    Given a list of unique points, map one to the given coordinates.
    """

    for p in point_list:
        if p["coordinates"] == coords:
            return p["idx"]

    print("Couldn't find the point -- {}!\n".format(str(point_list)))


def filter_coords(coords):
    """
    Remove duplicate coordinates in LineString data; preserve coordinate ordering.
    """

    unique = []
    [unique.append(item) for item in coords if item not in unique]

    return unique


def assign_point_ids(point_list):
    """
    For each point, assign a unique id.
    """

    i = 0
    ret = []

    for point in point_list:
        coords = point["coordinates"]
        next_list = point["properties"]["next"]
        entry = build_point_entry(coords, next_list, i)
        ret.append(entry)
        i += 1

    return ret


def build_line_entry(coords, start, end):
    """
    Construct a new LineString with additional data.
    """

    entry = \
        {
            "geometry":
                {
                    "coordinates": filter_coords(coords),
                    "type": "LineString"
                },
            "properties":
                {
                    "start": start,
                    "end": end
                },
            "type": "Feature"
        }

    return entry


def build_written_line_entry(line_list):
    """
    Remove start and end points from all line entries before writing to file.
    """

    def _build_written_line_entry(coords):

        entry = \
            {
                "geometry":
                    {
                        "coordinates": coords,
                        "type": "LineString"
                    },
                "type": "Feature"
            }

        return entry

    ret = []

    for line in line_list:
        ret.append(_build_written_line_entry(line["geometry"]["coordinates"]))

    return ret


def sort_next_lists(next_list, adjacent):
    """
    Sort a next list, append adjacent nodes if present.
    """

    ret = []

    if adjacent is not None:
        for nl in next_list:
            if nl:
                temp = [nl]
                for pt in adjacent:
                    if pt in nl:
                        temp.append(pt)

                ret.append(temp)
    else:
        for nl in next_list:
            if nl:
                ret.append(sorted(nl))

    return ret


def build_point_entry(coords, next_list, idx, adjacent=None):
    """
    Add an ID to a Point.
    """

    entry = \
        {
            "coordinates": coords,
            "properties":
                {
                    "next": sort_next_lists(next_list, adjacent)
                },
            "type": "Point",
            "idx": idx
        }

    return entry


def build_line_records(line_list, point_list):
    """
    Determine start and end points for each line.
    """

    ret = []

    for line in line_list:

        coords = line["geometry"]["coordinates"]

        start_coords = coords[0]
        end_coords = coords[-1]

        start_id = find_point(start_coords, point_list)
        end_id = find_point(end_coords, point_list)

        entry = build_line_entry(coords, start_id, end_id)
        ret.append(entry)

    return ret


def build_adjacency_lists(line_list, point_list):
    """
    Construct list of adjacent points for every point.
    """

    def _build_adjacency_lists(ll, pt):

        adjacent = []

        idx = pt["idx"]

        for line in ll:

            if line["properties"]["start"] == idx:
                adjacent.append(line["properties"]["end"])
            elif line["properties"]["end"] == idx:
                adjacent.append(line["properties"]["start"])
            else:
                continue

        return build_point_entry(pt["coordinates"], pt["properties"]["next"], pt["idx"], adjacent)

    ret = []

    for point in point_list:

        entry = _build_adjacency_lists(line_list, point)
        ret.append(entry)

    return ret


def extract_polygon(points_list, next_list):

    lats, longs = [], []
    ret = []

    for pt in next_list:
        lats.append(points_list[pt]["coordinates"][0])
        longs.append(points_list[pt]["coordinates"][1])

    all_points = np.column_stack((lats, longs))
    hull_points = ConvexHull(all_points)

    verts = hull_points.vertices

    for v in verts:
        ret.append(next_list[v])

    return ret


def _point_list_to_polygon(points_list, point):

    ret_polys = []

    for next_list in point["properties"]["next"]:

        filtered_list = []

        if len(next_list[0]) > 2:
            poly_points = extract_polygon(points_list, next_list[0])
        else:
            poly_points = next_list[0]

        filtered_list.append(poly_points)

        for i in range(len(next_list)):
            if i != 0:
                filtered_list.append(next_list[i])

        ret_polys.append(filtered_list)

    return ret_polys


def point_list_to_polygon(point_list):

    ret = []

    for point in point_list:
        ret.append(_point_list_to_polygon(point_list, point))

    return ret


def build_full_data(datapoints):
    """
    Render parsed data as json.
    """

    ret = \
        {
            "features": datapoints,
            "type": "geoql"
        }

    return json.dumps(ret, indent=4, separators=(',', ': '))


if __name__ == '__main__':

    lines = []
    points = []

    with open(sys.argv[1], 'r', encoding='utf8') as in_file:

        json_data = json.load(in_file)

        for f in json_data["features"]:

            if "geometry" in f:
                lines.append(f)
            else:
                points.append(f)

    points_with_ids = assign_point_ids(points)
    line_records = build_line_records(lines, points_with_ids)
    points_with_adjacency = build_adjacency_lists(line_records, points_with_ids)
    filtered_line_records = build_written_line_entry(line_records)

    filtered_points = point_list_to_polygon(points_with_adjacency)

    full_data = filtered_line_records + points_with_adjacency

    with open(sys.argv[2], 'w', encoding='utf8') as out_file:

        out_data = build_full_data(full_data)

        out_file.write(out_data)

