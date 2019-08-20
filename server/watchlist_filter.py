import json
def get_stars(starlist):
    i=0
    data = json.load(open('../www/data/dsos.14.json', 'r'))
    for star_name in starlist:
        for col,keys in enumerate(data['features']):
            if star_name == keys['id']:
                print(col,star_name)
#Binosky list
get_stars(["NGC104","M31","NGC292","NGC869","NGC884"
"Mel20","M45","Mel25","M42","NGC1981","M43","M35",
"NGC2232","M41","M47","NGC2451","NGC2516","M44","IC2391",
"NGC3114","IC2602","NGC3532","Mel111","NGC4755","NGC5139",
"NGC6231","M6","M7","M8","NGC6530","M39"])
