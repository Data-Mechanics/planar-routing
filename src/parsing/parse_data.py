import json
import sys


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
    Remove duplicate coordinates in LineString data.
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


def build_point_entry(coords, next_list, idx, adjacent=None):
    """
    Add an ID to a Point.
    """

    entry = \
        {
            "coordinates": coords,
            "properties":
                {
                    "next": next_list,
                    "adjacent": adjacent
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


def _build_adjacency_lists(line_list, point):
    """
    Construct adjacency list for an individual point.
    """

    adjacent = []

    idx = point["idx"]

    for line in line_list:

        if line["properties"]["start"] == idx:
            adjacent.append(line["properties"]["end"])
        elif line["properties"]["end"] == idx:
            adjacent.append(line["properties"]["start"])
        else:
            continue

    ret = build_point_entry(point["coordinates"], point["properties"]["next"], point["idx"], adjacent)

    return ret


def build_adjacency_lists(line_list, point_list):
    """
    Construct list of adjacent points for every point.
    """

    ret = []

    for point in point_list:

        entry = _build_adjacency_lists(line_list, point)
        ret.append(entry)

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

    full_data = line_records + points_with_adjacency

    with open(sys.argv[2], 'w', encoding='utf8') as out_file:

        out_data = build_full_data(full_data)

        out_file.write(out_data)









