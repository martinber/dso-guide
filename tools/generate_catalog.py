import json


def get_dso_id(data, dso_name):
    for index, keys in enumerate(data['features']):
        if dso_name == keys['id']:
            return index
    return -1


def add_dso_to_catalog(catalog, dso_id, source_catalog_name):
    # Search if the object already is on the catalog
    for dso in catalog:
        if dso["id"] == dso_id:
            dso["appears_on"].append(source_catalog_name)
            break
    # Else add the object to the catalog
    else:
        catalog.append({
            "id": dso_id,
            "appears_on": [source_catalog_name],
        })


# Names of DSOs by catalog
source_catalogs = [
    {
        "name": "Binosky",
        "dso_names": ["NGC104", "M31", "NGC292", "NGC869", "NGC884", "Mel20",
            "M45", "Mel25", "M42", "NGC1981", "M43", "M35", "NGC2232", "M41",
            "M47", "NGC2451", "NGC2516", "M44", "IC2391", "NGC3114", "IC2602",
            "NGC3532", "Mel111", "NGC4755", "NGC5139", "NGC6231", "M6", "M7",
            "M8", "NGC6530", "M39"],
    },
    {
        "name": "Caldwell",
        "dso_names": ["NGC188", "NGC40", "NGC4236", "NGC7023", "IC 342",
            "NGC6543", "Hyades", "CoalSack", "NGC2403", "NGC559", "Sh2-155",
            "NGC663", "NGC7635", "NGC6946", "NGC457", "NGC869", "NGC6826",
            "NGC7243", "NGC147", "NGC185", "IC 5146", "NGC7000", "NGC4449",
            "NGC7662", "NGC891", "NGC1275", "NGC2419", "NGC4244", "NGC6888",
            "NGC752", "NGC5005", "NGC7331", "IC 405", "NGC4631", "NGC6992",
            "NGC6960", "NGC4889", "NGC4559", "NGC6885", "NGC4565", "NGC2392",
            "NGC3626", "NGC7006", "NGC7814", "NGC7479", "NGC5248", "NGC2261",
            "NGC6934", "NGC2775", "NGC2237", "NGC2244", "IC 1613", "NGC4697",
            "NGC3115", "NGC2506", "NGC7009", "NGC246", "NGC6822", "NGC2360",
            "NGC3242", "NGC4038", "NGC4039", "NGC247", "NGC7293", "NGC2362",
            "NGC253", "NGC5694", "NGC1097", "NGC6729", "NGC6302", "NGC300",
            "NGC2477", "NGC55", "NGC1851", "NGC3132", "NGC6124", "NGC6231",
            "NGC5128", "NGC6541", "NGC3201", "NGC5139", "NGC6352", "NGC6193",
            "NGC4945", "NGC5286", "IC 2391", "NGC6397", "NGC1261", "NGC5823",
            "NGC6087", "NGC2867", "NGC3532", "NGC3372", "NGC6752", "NGC4755",
            "NGC6025", "NGC2516", "NGC3766", "NGC4609", "IC 2944", "NGC6744",
            "IC 2602", "NGC2070", "NGC362", "NGC4833", "NGC104", "NGC6101",
            "NGC4372", "NGC3195"],
    },
    {
        "name": "110 Deep-Sky Highlights",
        "dso_names": ["NGC55", "NGC104", "M31", "NGC253", "NGC300", "NGC362",
            "NGC457", "SMC", "LMC", "M33", "NGC869", "NGC884", "M77", "NGC1291",
            "NGC1313", "NGC1316", "NGC1435", "NGC1535", "NGC1851", "M1",
            "NGC1977", "M42", "NGC2024", "M78", "M37", "NGC2070", "M35", "M41",
            "NGC2392", "NGC2403", "M46", "NGC2440", "M93", "NGC2477", "NGC2516",
            "NGC2547", "M67", "NGC2808", "NGC2903", "M81", "M82", "NGC3114",
            "NGC3115", "NGC3201", "NGC3242", "NGC3293", "NGC3372", "NGC3532",
            "NGC3521", "M66", "NGC3766", "NGC3918", "M106", "M86", "M49", "M87",
            "M104", "M60", "M94", "NGC4755", "M64", "NGC4833", "NGC4945", "M63",
            "NGC5128", "NGC5139", "M51", "M83", "M3", "M101", "M5", "NGC6067",
            "M4", "M13", "M12", "NGC6231", "M10", "M62", "M19", "M92",
            "NGC6388", "M6", "NGC6397", "M7", "M23", "M20", "M8", "NGC6541",
            "M16", "M17", "M28", "M22", "M11", "M57", "NGC6744", "NGC6752",
            "M55", "NGC6818", "NGC6822", "M27", "NGC6946", "NGC6992", "NGC7009",
            "NGC7027", "M15", "M2", "M52", "NGC7662", "NGC7789"]
    },
    {
        "name": "Benett",
        "dso_names": ["NGC55", "NGC104", "NGC247", "NGC253", "NGC288", "NGC300",
            "NGC362", "NGC613", "NGC1068", "NGC1097", "NGC1232", "NGC1261",
            "NGC1291", "NGC1313", "NGC1316", "NGC1350", "NGC1360", "NGC1365",
            "NGC1380", "NGC1387", "NGC1399", "NGC1398", "NGC1404", "NGC1433",
            "NGC1512", "NGC1535", "NGC1549", "NGC1553", "NGC1566", "NGC1617",
            "NGC1672", "NGC1763", "NGC1783", "NGC1792", "NGC1818", "NGC1808",
            "NGC1851", "NGC1866", "NGC1904", "NGC2070", "NGC2214", "NGC2243",
            "NGC2298", "NGC2467", "NGC2489", "NGC2506", "NGC2627", "NGC2671",
            "NGC2808", "NGC2972", "NGC2997", "NGC3115", "NGC3132", "NGC3201",
            "NGC3242", "NGC3621", "Mel105", "NGC3960", "NGC3923", "NGC4372",
            "NGC4590", "NGC4594", "NGC4697", "NGC4699", "NGC4753", "NGC4833",
            "NGC4945", "NGC4976", "NGC5061", "NGC5068", "NGC5128", "NGC5139",
            "NGC5189", "NGC5236", "NGC5253", "NGC5286", "NGC5617", "NGC5634",
            "NGC5824", "NGC5897", "NGC5927", "NGC5986", "NGC5999", "NGC6005",
            "Tr23", "NGC6093", "NGC6101", "NGC6121", "NGC6134", "NGC6144",
            "NGC6139", "NGC6171", "NGC6167", "NGC6192", "NGC6218", "NGC6216",
            "NGC6235", "NGC6254", "NGC6253", "NGC6266", "NGC6273", "NGC6284",
            "NGC6287", "NGC6293", "NGC6304", "NGC6316", "NGC6318", "NGC6333",
            "NGC6356", "NGC6352", "NGC6362", "NGC6388", "NGC6402", "NGC6397",
            "NGC6440", "NGC6445", "NGC6441", "NGC6496", "NGC6522", "NGC6528",
            "NGC6544", "NGC6541", "NGC6553", "NGC6569", "NGC6584", "NGC6603",
            "NGC6618", "NGC6624", "NGC6626", "NGC6638", "NGC6637", "NGC6642",
            "NGC6652", "NGC6656", "NGC6681", "NGC6705", "NGC6712", "NGC6715",
            "NGC6723", "NGC6744", "NGC6752", "NGC6809", "NGC6818", "NGC6864",
            "NGC6981", "NGC7009", "NGC7089", "NGC7099", "NGC7293", "NGC7410",
            "IC1459", "NGC7793"],
    },
    {
        "name": "AAAA Northern Urban",
        "dso_names": ["NGC129", "NGC221", "NGC224", "NGC457", "NGC663", "Cr463",
            "NGC752", "Stock2", "NGC869", "NGC884", "Tr2", "NGC1068", "Tr3",
            "Stock23", "Mel20", "NGC1342", "M45", "Hyades", "NGC1647",
            "NGC1807", "NGC1817", "NGC1912", "NGC1960", "NGC1976", "NGC1981",
            "NGC2099", "NGC2168", "NGC2169", "NGC2232", "NGC2244", "NGC2264",
            "NGC2281", "NGC2287", "NGC2301", "NGC2323", "NGC2392", "NGC2539",
            "NGC2548", "NGC2632", "NGC2682", "NGC3031", "NGC3034", "NGC3242",
            "Mel111", "NGC4374", "NGC4406", "NGC4486", "NGC4594", "NGC4736",
            "NGC4826", "NGC5272", "NGC5904", "NGC6121", "NGC6205", "NGC6210",
            "NGC6218", "NGC6254", "NGC6266", "NGC6341", "NGC6405", "IC4665",
            "NGC6475", "NGC6520", "NGC6523", "NGC6618", "NGC6633", "NGC6656",
            "IC4756", "NGC6705", "NGC6709", "NGC6720", "Cr399", "NGC6818",
            "NGC6826", "NGC6853", "NGC6910", "NGC6934", "NGC6940", "NGC7009",
            "NGC7078", "NGC7089", "NGC7092", "NGC7160", "NGC7209", "NGC7243",
            "NGC7662", "NGC7789"],
    },
    {
        "name": "Southern Sky Binocular",
        "dso_names": ["NGC104", "SMC", "NGC362", "NGC1261", "NGC1851", "LMC",
            "NGC2070", "NGC2451", "NGC2477", "NGC2516", "NGC2547", "NGC2546",
            "NGC2627", "IC2391", "IC2395", "NGC2659", "NGC2670", "NGC2808",
            "IC2488", "NGC2910", "NGC2925", "NGC3114", "NGC3201", "NGC3228",
            "NGC3293", "Mel101", "IC2602", "NGC3372", "NGC3532", "IC2714",
            "Mel105", "NGC3766", "NGC4052", "NGC4103", "NGC4337", "NGC4349",
            "H5", "NGC4463", "H6", "NGC4609", "COALSACK", "NGC4755", "NGC4815",
            "NGC4833", "NGC4852", "NGC5128", "NGC5139", "NGC5286", "NGC5316",
            "NGC5460", "NGC5617", "NGC5662", "NGC5822", "NGC5823", "NGC5925",
            "NGC6025", "NGC6067", "H10", "NGC6087", "NGC6124", "NGC6134",
            "NGC6152", "NGC6167", "NGC6208", "NGC6231", "H13", "IC4651",
            "NGC6352", "NGC6362", "NGC6397", "NGC6541", "NGC6584", "NGC6752"],
    },
]

if __name__ == "__main__":

    # Catalog to export on json format, e.g.:
    # catalog = [
    #     {
    #         id: 6217,
    #         appears_on: ["Binosky", "Caldwell"],
    #     },
    #     {
    #         id: 37,
    #         appears_on: ["Binosky"],
    #     },
    # ]
    catalog = []

    with open('../app/www/data/dsos.14.json', 'r') as f:
        data = json.load(f)

        for source_catalog in source_catalogs:
            for dso_name in source_catalog["dso_names"]:

                dso_id = get_dso_id(data, dso_name)
                if dso_id == -1:
                    print("dso_name {} not found on data file".format(dso_name))
                else:
                    add_dso_to_catalog(catalog, dso_id, source_catalog["name"])

    with open('../app/www/app/catalog.js', 'w') as f:
        catalog_json = json.dumps(catalog)
        f.write(
            "// File generated using tools/generate_catalog.py, do not touch\n"
            "export const catalog = " + catalog_json + ";"
        )
