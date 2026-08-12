# Authoritative backend replica of the 43 SKUs across 15 product families
BACKEND_PRODUCTS = [
    {
        "id": "moong-master",
        "slug": "moong-master-papad",
        "name": "Moong Master Papad",
        "category": "moong",
        "variant": "Classic",
        "skus": [
            {"sku": "KS-MMP-200", "packSize": 200, "mrp": 110, "websitePrice": 89, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MMP-500", "packSize": 500, "mrp": 249, "websitePrice": 199, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MMP-1000", "packSize": 1000, "mrp": 499, "websitePrice": 429, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "moong-garlic",
        "slug": "moong-garlic-papad",
        "name": "Moong Garlic Papad",
        "category": "moong",
        "variant": "Garlic",
        "skus": [
            {"sku": "KS-MGP-200", "packSize": 200, "mrp": 125, "websitePrice": 99, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MGP-500", "packSize": 500, "mrp": 309, "websitePrice": 259, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MGP-1000", "packSize": 1000, "mrp": 619, "websitePrice": 539, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "moong-jeera",
        "slug": "moong-jeera-papad",
        "name": "Moong Jeera Papad",
        "category": "moong",
        "variant": "Jeera",
        "skus": [
            {"sku": "KS-MJP-200", "packSize": 200, "mrp": 109, "websitePrice": 89, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MJP-500", "packSize": 500, "mrp": 279, "websitePrice": 229, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MJP-1000", "packSize": 1000, "mrp": 559, "websitePrice": 489, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "moong-pudhina",
        "slug": "moong-pudhina-papad",
        "name": "Moong Pudhina Papad",
        "category": "moong",
        "variant": "Pudhina",
        "skus": [
            {"sku": "KS-MPP-200", "packSize": 200, "mrp": 105, "websitePrice": 85, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MPP-500", "packSize": 500, "mrp": 265, "websitePrice": 219, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MPP-1000", "packSize": 1000, "mrp": 529, "websitePrice": 459, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "moong-green-chilli",
        "slug": "moong-green-chilli-papad",
        "name": "Moong Green Chilli Papad",
        "category": "moong",
        "variant": "Green Chilli",
        "skus": [
            {"sku": "KS-MGCP-200", "packSize": 200, "mrp": 105, "websitePrice": 85, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MGCP-500", "packSize": 500, "mrp": 265, "websitePrice": 219, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MGCP-1000", "packSize": 1000, "mrp": 529, "websitePrice": 459, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "moong-kasuri-methi",
        "slug": "moong-kasuri-methi-papad",
        "name": "Moong Kasuri Methi Papad",
        "category": "moong",
        "variant": "Kasuri Methi",
        "skus": [
            {"sku": "KS-MKMP-200", "packSize": 200, "mrp": 109, "websitePrice": 89, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MKMP-500", "packSize": 500, "mrp": 229, "websitePrice": 49, "shipping": 189, "freeShipping": False},
            {"sku": "KS-MKMP-1000", "packSize": 1000, "mrp": 559, "websitePrice": 489, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "moong-punjabi-masala",
        "slug": "moong-punjabi-masala-papad",
        "name": "Moong Punjabi Masala Papad",
        "category": "moong",
        "variant": "Punjabi Masala",
        "skus": [
            {"sku": "KS-MPMP-200", "packSize": 200, "mrp": 119, "websitePrice": 99, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MPMP-500", "packSize": 500, "mrp": 299, "websitePrice": 249, "shipping": 49, "freeShipping": False},
            {"sku": "KS-MPMP-1000", "packSize": 1000, "mrp": 599, "websitePrice": 529, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "chana-chotu",
        "slug": "chana-chotu-papad",
        "name": "Chana Chotu Papad",
        "category": "chana",
        "variant": "Classic",
        "skus": [
            {"sku": "KS-CCP-200", "packSize": 200, "mrp": 110, "websitePrice": 89, "shipping": 49, "freeShipping": False},
            {"sku": "KS-CCP-500", "packSize": 500, "mrp": 249, "websitePrice": 199, "shipping": 49, "freeShipping": False},
            {"sku": "KS-CCP-1000", "packSize": 1000, "mrp": 499, "websitePrice": 429, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "chana-garlic",
        "slug": "chana-garlic-papad",
        "name": "Chana Garlic Papad",
        "category": "chana",
        "variant": "Garlic",
        "skus": [
            {"sku": "KS-CGP-200", "packSize": 200, "mrp": 125, "websitePrice": 99, "shipping": 49, "freeShipping": False},
            {"sku": "KS-CGP-500", "packSize": 500, "mrp": 309, "websitePrice": 259, "shipping": 49, "freeShipping": False},
            {"sku": "KS-CGP-1000", "packSize": 1000, "mrp": 619, "websitePrice": 539, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "chana-khata-mitha",
        "slug": "chana-khata-mitha-papad",
        "name": "Chana Khata Mitha Papad",
        "category": "chana",
        "variant": "Khata Mitha",
        "skus": [
            {"sku": "KS-CKM-200", "packSize": 200, "mrp": 99, "websitePrice": 79, "shipping": 49, "freeShipping": False},
            {"sku": "KS-CKM-500", "packSize": 500, "mrp": 249, "websitePrice": 199, "shipping": 49, "freeShipping": False},
            {"sku": "KS-CKM-1000", "packSize": 1000, "mrp": 499, "websitePrice": 429, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "chana-tomato",
        "slug": "chana-tomato-papad",
        "name": "Chana Tomato Papad",
        "category": "chana",
        "variant": "Tomato",
        "skus": [
            {"sku": "KS-CTP-200", "packSize": 200, "mrp": 99, "websitePrice": 79, "shipping": 49, "freeShipping": False},
            {"sku": "KS-CTP-500", "packSize": 500, "mrp": 249, "websitePrice": 199, "shipping": 49, "freeShipping": False},
            {"sku": "KS-CTP-1000", "packSize": 1000, "mrp": 499, "websitePrice": 429, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "chana-punjabi-masala",
        "slug": "chana-punjabi-masala-papad",
        "name": "Chana Punjabi Masala Papad",
        "category": "chana",
        "variant": "Punjabi Masala",
        "skus": [
            {"sku": "KS-CPM-200", "packSize": 200, "mrp": 119, "websitePrice": 99, "shipping": 49, "freeShipping": False},
            {"sku": "KS-CPM-500", "packSize": 500, "mrp": 299, "websitePrice": 249, "shipping": 49, "freeShipping": False},
            {"sku": "KS-CPM-1000", "packSize": 1000, "mrp": 599, "websitePrice": 529, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "urad-guru",
        "slug": "urad-guru-papad",
        "name": "Urad Guru Papad",
        "category": "urad",
        "variant": "Classic",
        "skus": [
            {"sku": "KS-UGP-200", "packSize": 200, "mrp": 119, "websitePrice": 99, "shipping": 49, "freeShipping": False},
            {"sku": "KS-UGP-500", "packSize": 500, "mrp": 299, "websitePrice": 249, "shipping": 49, "freeShipping": False},
            {"sku": "KS-UGP-1000", "packSize": 1000, "mrp": 599, "websitePrice": 529, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "urad-garlic",
        "slug": "urad-garlic-papad",
        "name": "Urad Garlic Papad",
        "category": "urad",
        "variant": "Garlic",
        "skus": [
            {"sku": "KS-UGG-200", "packSize": 200, "mrp": 125, "websitePrice": 99, "shipping": 49, "freeShipping": False},
            {"sku": "KS-UGG-500", "packSize": 500, "mrp": 319, "websitePrice": 269, "shipping": 49, "freeShipping": False},
            {"sku": "KS-UGG-1000", "packSize": 1000, "mrp": 639, "websitePrice": 559, "shipping": 0, "freeShipping": True},
        ]
    },
    {
        "id": "combo-235",
        "slug": "kawad-swad-combo-pack",
        "name": "Kawad Swad Combo Pack",
        "category": "combo",
        "variant": "Assorted",
        "skus": [
            {"sku": "KS-COMB-235", "packSize": 235, "mrp": 199, "websitePrice": 189, "shipping": 49, "freeShipping": False},
        ]
    }
]

def find_sku_in_backend(sku_code: str):
    for family in BACKEND_PRODUCTS:
        for sku in family["skus"]:
            if sku["sku"] == sku_code:
                return family, sku
    return None, None
