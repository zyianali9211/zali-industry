# =============================================================
#  generate-products-data.ps1
#  Scans FinalAllProductsZali/Downloads and produces products-data.js
# =============================================================

$siteRoot     = "e:\zaliSiteFinal"
$downloadsPath = "$siteRoot\public\FinalAllProductsZali\Downloads"
$outputFile   = "$siteRoot\public\products-data.js"

# ---- helpers ------------------------------------------------

function ConvertTo-Slug($text) {
    if (-not $text) { return "" }
    $s = $text.ToLower()
    $s = $s -replace '[^a-z0-9\s-]', ''
    $s = $s -replace '\s+', '-'
    $s = $s -replace '-+', '-'
    $s = $s.Trim('-')
    return $s
}

function EscapeJs($text) {
    if (-not $text) { return "" }
    $text = $text -replace '\\', '\\'
    $text = $text -replace "'", "\'"
    $text = $text -replace "`r`n", '\n'
    $text = $text -replace "`n", '\n'
    $text = $text -replace "`r", '\n'
    return $text
}

function Parse-ProductInfo($txtPath) {
    $result = @{
        name         = ""
        gender       = ""
        title        = ""
        description  = ""
        garmentType  = ""
        fabric       = ""
        moq          = 25
    }

    if (-not (Test-Path $txtPath)) { return $result }

    $raw = Get-Content $txtPath -Raw -Encoding UTF8
    if (-not $raw) { return $result }

    # Product name (first line field)
    if ($raw -match '(?m)^Product:\s*(.+)$') { $result.name = $matches[1].Trim() }

    # Gender
    if ($raw -match '(?m)^Gender:\s*(.+)$') { $result.gender = $matches[1].Trim() }

    # GARMENT_TYPE
    if ($raw -match '(?m)^GARMENT_TYPE:\s*(.+)$') { $result.garmentType = $matches[1].Trim() }

    # FABRIC
    if ($raw -match '(?m)^FABRIC:\s*(.+)$') { $result.fabric = $matches[1].Trim() }

    # TITLE (from GENERATED TEXT section)
    if ($raw -match '(?s)--- GENERATED TEXT ---.*?TITLE:\s*(.+?)(\r?\n)') {
        $result.title = $matches[1].Trim()
    }

    # DESCRIPTION (the multi-line block after TITLE:)
    if ($raw -match '(?s)TITLE:[^\n]*\r?\n\r?\nDESCRIPTION:\r?\n(.*?)(?=\r?\n---|$)') {
        $result.description = $matches[1].Trim()
    } elseif ($raw -match '(?s)--- GENERATED TEXT ---.*?DESCRIPTION:\r?\n(.*?)$') {
        $result.description = $matches[1].Trim()
    }

    # MOQ
    if ($raw -match 'MOQ:\s*(\d+)') { $result.moq = [int]$matches[1] }

    return $result
}

function Get-ProductImages($productFolderPath) {
    $imgs = [ordered]@{}

    # Keyword -> JS key map. Order matters: model_front is aliased to model_action slot.
    $keywordMap = [ordered]@{
        'flat_lay'     = 'flat_lay'
        'ghost_front'  = 'ghost_front'
        'ghost_back'   = 'ghost_back'
        'ghost_side'   = 'ghost_side'
        'model_action' = 'model_action'
        'model_front'  = 'model_action'   # alias
        'model_torso'  = 'model_torso'
        'model_back'   = 'model_back'
        'model_bottom' = 'model_bottom'
        'detail'       = 'detail'
    }

    $pngs = Get-ChildItem $productFolderPath -Filter "*.png" -ErrorAction SilentlyContinue | Sort-Object Name

    foreach ($file in $pngs) {
        # Strip leading numeric prefix (e.g. "01_", "02_") then lowercase
        $stem = [System.IO.Path]::GetFileNameWithoutExtension($file.Name).ToLower() -replace '^\d+_', ''

        foreach ($keyword in $keywordMap.Keys) {
            $jsKey = $keywordMap[$keyword]
            if ($stem -eq $keyword -or $stem -like "${keyword}_*") {
                if (-not $imgs.Contains($jsKey)) {
                    $absPath     = $file.FullName -replace '\\', '/'
                    $siteRootFwd = $siteRoot -replace '\\', '/'
                    $relPath     = $absPath -ireplace [regex]::Escape($siteRootFwd + '/'), ''
                    # URL-encode spaces so img src works in all browsers/servers
                    $relPath     = $relPath -replace ' ', '%20'
                    $imgs[$jsKey] = $relPath
                }
                break
            }
        }
    }

    return $imgs
}


function MakeRelPath($absPath) {
    return $absPath.Replace("$siteRoot\", "").Replace("\", "/")
}

# ---- Team Sports sport-keyword mapping ----------------------

function Get-TeamSportInfo($productName) {
    $n = $productName.ToLower()
    # Most Popular
    if ($n -match 'american football|7.on.7|7on7|flag football|football jersey|football pant|football practice') {
        return @{ group = "Most Popular"; sport = "American Football" }
    }
    if ($n -match '\bbaseball\b') {
        return @{ group = "Most Popular"; sport = "Baseball" }
    }
    if ($n -match '\bbasketball\b|reversible jersey basketball|reveradsble jersey') {
        return @{ group = "Most Popular"; sport = "Basketball" }
    }
    if ($n -match '\bsoccer\b') {
        return @{ group = "Most Popular"; sport = "Soccer" }
    }
    if ($n -match '\bsoftball\b') {
        return @{ group = "Most Popular"; sport = "Softball" }
    }
    if ($n -match '\bvolleyball\b|libero jersey') {
        return @{ group = "Most Popular"; sport = "Volleyball" }
    }
    # Field & Court
    if ($n -match '\brugby\b') {
        return @{ group = "Field & Court"; sport = "Rugby" }
    }
    if ($n -match '\bcricket\b') {
        return @{ group = "Field & Court"; sport = "Cricket" }
    }
    if ($n -match '\blackrosse\b') {
        return @{ group = "Field & Court"; sport = "Lacrosse" }
    }
    if ($n -match 'field hockey') {
        return @{ group = "Field & Court"; sport = "Field Hockey" }
    }
    if ($n -match 'ice hockey') {
        return @{ group = "Field & Court"; sport = "Ice Hockey" }
    }
    if ($n -match '\bpickleball\b') {
        return @{ group = "Field & Court"; sport = "Pickleball" }
    }
    if ($n -match '\bnetball\b') {
        return @{ group = "Field & Court"; sport = "Netball" }
    }
    # Track, Cycling & Combat
    if ($n -match '\bcycling\b') {
        return @{ group = "Track, Cycling & Combat"; sport = "Cycling" }
    }
    if ($n -match '\btrack\b') {
        return @{ group = "Track, Cycling & Combat"; sport = "Track & Field" }
    }
    if ($n -match 'roller derby') {
        return @{ group = "Track, Cycling & Combat"; sport = "Roller Derby" }
    }
    if ($n -match '\browing\b|uni.suit|paddling') {
        return @{ group = "Track, Cycling & Combat"; sport = "Rowing / Crew" }
    }
    if ($n -match '\bmotocross\b|motocross pants|mx uniform') {
        return @{ group = "Track, Cycling & Combat"; sport = "Motocross / BMX" }
    }
    if ($n -match '\bbmx\b') {
        return @{ group = "Track, Cycling & Combat"; sport = "Motocross / BMX" }
    }
    # Specialty
    if ($n -match '\besports\b') {
        return @{ group = "Specialty"; sport = "Esports" }
    }
    if ($n -match 'team polo|pre.match') {
        return @{ group = "Specialty"; sport = "Training Tops" }
    }
    # SurfWear overflow (beach/swim items mistakenly in folder 1)
    if ($n -match 'beach walkshort|boardshort|swim short|swim short') {
        return @{ group = "SURFWEAR_OVERFLOW"; sport = "In-Water Bottoms" }
    }
    # Default fallback
    return @{ group = "Specialty"; sport = "Other" }
}

# ---- Build catalog ------------------------------------------

$catalog = [ordered]@{}

# Define the 5 main categories (in display order)
$mainCats = @(
    [ordered]@{ folder = "Casual Wear";  id = "casual-wear";  name = "Casual Wear" },
    [ordered]@{ folder = "Fightwear";    id = "fightwear";    name = "Fightwear" },
    [ordered]@{ folder = "FitnessWear";  id = "fitnesswear";  name = "FitnessWear" },
    [ordered]@{ folder = "SurfWear";     id = "surfwear";     name = "SurfWear" },
    [ordered]@{ folder = "Team Sports";  id = "team-sports";  name = "Team Sports" }
)

$allProducts   = [System.Collections.Generic.List[object]]::new()
$surfOverflow  = [System.Collections.Generic.List[object]]::new()  # beach/swim items from folder 1

foreach ($cat in $mainCats) {
    $catFolder = "$downloadsPath\$($cat.folder)"
    $catEntry  = [ordered]@{
        id   = $cat.id
        name = $cat.name
        slug = $cat.id
        subcategories = [System.Collections.Generic.List[object]]::new()
    }

    if (-not (Test-Path $catFolder)) {
        Write-Warning "Category folder not found: $catFolder"
        continue
    }

    if ($cat.folder -eq "Team Sports") {
        # Team Sports: iterate subcategory groups (Most Popular, Field & Court, etc.)
        $groupFolders = Get-ChildItem $catFolder -Directory
        foreach ($grpDir in $groupFolders) {
            $grpName = $grpDir.Name
            # Inside each group there are sport-specific folders
            $sportFolders = Get-ChildItem $grpDir.FullName -Directory
            foreach ($sportDir in $sportFolders) {
                $sportName = $sportDir.Name
                $subcatEntry = [ordered]@{
                    id       = ConvertTo-Slug("$($cat.id)-$sportName")
                    name     = $sportName
                    group    = $grpName
                    slug     = ConvertTo-Slug($sportName)
                    products = [System.Collections.Generic.List[object]]::new()
                }
                # Products in this sport folder
                $productFolders = Get-ChildItem $sportDir.FullName -Directory
                foreach ($prodDir in $productFolders) {
                    $infoPath = "$($prodDir.FullName)\product_info.txt"
                    $info     = Parse-ProductInfo $infoPath
                    $imgs     = Get-ProductImages $prodDir.FullName
                    $prodName = if ($info.name) { $info.name } else { $prodDir.Name -replace '-[a-f0-9]{6}$', '' }
                    $prodId   = ConvertTo-Slug("$($cat.id)-$sportName-$($prodDir.Name)")

                    $prod = [ordered]@{
                        id           = $prodId
                        name         = $prodName
                        folderName   = $prodDir.Name
                        category     = $cat.name
                        categoryId   = $cat.id
                        subcategory  = $sportName
                        subcategoryId= ConvertTo-Slug($sportName)
                        group        = $grpName
                        gender       = $info.gender
                        title        = if ($info.title) { $info.title } else { $prodName }
                        description  = $info.description
                        garmentType  = $info.garmentType
                        fabric       = $info.fabric
                        moq          = $info.moq
                        images       = $imgs
                    }
                    $subcatEntry.products.Add($prod)
                    $allProducts.Add($prod)
                }
                if ($subcatEntry.products.Count -gt 0) {
                    $catEntry.subcategories.Add($subcatEntry)
                }
            }
        }
    } else {
        # Other categories: iterate subcategory folders directly
        $subcatFolders = Get-ChildItem $catFolder -Directory
        foreach ($subcatDir in $subcatFolders) {
            $subcatName  = $subcatDir.Name
            $subcatEntry = [ordered]@{
                id       = ConvertTo-Slug("$($cat.id)-$subcatName")
                name     = $subcatName
                slug     = ConvertTo-Slug($subcatName)
                products = [System.Collections.Generic.List[object]]::new()
            }

            $productFolders = Get-ChildItem $subcatDir.FullName -Directory
            foreach ($prodDir in $productFolders) {
                $infoPath = "$($prodDir.FullName)\product_info.txt"
                $info     = Parse-ProductInfo $infoPath
                $imgs     = Get-ProductImages $prodDir.FullName
                $prodName = if ($info.name) { $info.name } else { $prodDir.Name -replace '-[a-f0-9]{6}$', '' }
                $prodId   = ConvertTo-Slug("$($cat.id)-$subcatName-$($prodDir.Name)")

                $prod = [ordered]@{
                    id           = $prodId
                    name         = $prodName
                    folderName   = $prodDir.Name
                    category     = $cat.name
                    categoryId   = $cat.id
                    subcategory  = $subcatName
                    subcategoryId= ConvertTo-Slug($subcatName)
                    gender       = $info.gender
                    title        = if ($info.title) { $info.title } else { $prodName }
                    description  = $info.description
                    garmentType  = $info.garmentType
                    fabric       = $info.fabric
                    moq          = $info.moq
                    images       = $imgs
                }
                $subcatEntry.products.Add($prod)
                $allProducts.Add($prod)
            }

            if ($subcatEntry.products.Count -gt 0) {
                $catEntry.subcategories.Add($subcatEntry)
            }
        }
    }

    $catalog[$cat.id] = $catEntry
}

# Folder 1 processing removed, products are already categorized

# ---- Serialize to JS ----------------------------------------

Write-Host "Serializing $($allProducts.Count) products to JS..."

function ToJsValue($val) {
    if ($null -eq $val) { return "null" }
    if ($val -is [int] -or $val -is [long]) { return "$val" }
    if ($val -is [bool]) { return if ($val) { "true" } else { "false" } }
    if ($val -is [string]) { return "'" + (EscapeJs $val) + "'" }
    if ($val -is [System.Collections.IDictionary]) {
        $parts = foreach ($k in $val.Keys) { "      $k`: $(ToJsValue $val[$k])" }
        return "{`n" + ($parts -join ",`n") + "`n    }"
    }
    if ($val -is [System.Collections.IList]) {
        $parts = foreach ($item in $val) { "      $(ToJsValue $item)" }
        return "[`n" + ($parts -join ",`n") + "`n    ]"
    }
    return "'" + (EscapeJs "$val") + "'"
}

# Build JS manually for clean output
$sb = [System.Text.StringBuilder]::new()
$null = $sb.AppendLine("/* ZALI Industries - Product Catalog Data */")
$null = $sb.AppendLine("/* Auto-generated by generate-products-data.ps1 */")
$null = $sb.AppendLine("/* DO NOT EDIT MANUALLY */")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("window.ZALI_CATALOG = {")
$null = $sb.AppendLine("  categories: [")

$catKeys = @($catalog.Keys)
for ($ci = 0; $ci -lt $catKeys.Count; $ci++) {
    $catKey  = $catKeys[$ci]
    $cat     = $catalog[$catKey]
    $lastCat = ($ci -eq ($catKeys.Count - 1))

    $null = $sb.AppendLine("    {")
    $null = $sb.AppendLine("      id: '$(EscapeJs $cat.id)',")
    $null = $sb.AppendLine("      name: '$(EscapeJs $cat.name)',")
    $null = $sb.AppendLine("      slug: '$(EscapeJs $cat.slug)',")
    $null = $sb.AppendLine("      subcategories: [")

    $subcats = @($cat.subcategories)
    for ($si = 0; $si -lt $subcats.Count; $si++) {
        $sub     = $subcats[$si]
        $lastSub = ($si -eq ($subcats.Count - 1))
        $groupLine = if ($sub.group) { "          group: '$(EscapeJs $sub.group)'," } else { "" }

        $null = $sb.AppendLine("        {")
        $null = $sb.AppendLine("          id: '$(EscapeJs $sub.id)',")
        $null = $sb.AppendLine("          name: '$(EscapeJs $sub.name)',")
        if ($groupLine) { $null = $sb.AppendLine($groupLine) }
        $null = $sb.AppendLine("          slug: '$(EscapeJs $sub.slug)',")
        $null = $sb.AppendLine("          products: [")

        $products = @($sub.products)
        for ($pi = 0; $pi -lt $products.Count; $pi++) {
            $p       = $products[$pi]
            $lastProd = ($pi -eq ($products.Count - 1))

            # Build images object
            $imgParts = foreach ($imgKey in $p.images.Keys) {
                "              $imgKey`: '$(EscapeJs $p.images[$imgKey])'"
            }
            $imgStr = "{`n" + ($imgParts -join ",`n") + "`n            }"

            $groupField = if ($p.group) { "`n            group: '$(EscapeJs $p.group)'," } else { "" }

            $null = $sb.AppendLine("            {")
            $null = $sb.AppendLine("              id: '$(EscapeJs $p.id)',")
            $null = $sb.AppendLine("              name: '$(EscapeJs $p.name)',")
            $null = $sb.AppendLine("              folderName: '$(EscapeJs $p.folderName)',")
            $null = $sb.AppendLine("              category: '$(EscapeJs $p.category)',")
            $null = $sb.AppendLine("              categoryId: '$(EscapeJs $p.categoryId)',")
            $null = $sb.AppendLine("              subcategory: '$(EscapeJs $p.subcategory)',")
            $null = $sb.AppendLine("              subcategoryId: '$(EscapeJs $p.subcategoryId)',")
            if ($p.group) { $null = $sb.AppendLine("              group: '$(EscapeJs $p.group)',") }
            $null = $sb.AppendLine("              gender: '$(EscapeJs $p.gender)',")
            $null = $sb.AppendLine("              title: '$(EscapeJs $p.title)',")
            $null = $sb.AppendLine("              description: '$(EscapeJs $p.description)',")
            $null = $sb.AppendLine("              garmentType: '$(EscapeJs $p.garmentType)',")
            $null = $sb.AppendLine("              fabric: '$(EscapeJs $p.fabric)',")
            $null = $sb.AppendLine("              moq: $($p.moq),")
            $null = $sb.AppendLine("              images: $imgStr")
            $comma = if ($lastProd) { "" } else { "," }
            $null = $sb.AppendLine("            }$comma")
        }

        $null = $sb.AppendLine("          ]")
        $comma = if ($lastSub) { "" } else { "," }
        $null = $sb.AppendLine("        }$comma")
    }

    $null = $sb.AppendLine("      ]")
    $comma = if ($lastCat) { "" } else { "," }
    $null = $sb.AppendLine("    }$comma")
}

$null = $sb.AppendLine("  ]")
$null = $sb.AppendLine("};")
$null = $sb.AppendLine("")
$null = $sb.AppendLine("/* --- Flat lookup by product id --- */")
$null = $sb.AppendLine("window.ZALI_PRODUCT_MAP = {};")
$null = $sb.AppendLine("window.ZALI_CATALOG.categories.forEach(cat => {")
$null = $sb.AppendLine("  cat.subcategories.forEach(sub => {")
$null = $sb.AppendLine("    sub.products.forEach(p => {")
$null = $sb.AppendLine("      window.ZALI_PRODUCT_MAP[p.id] = p;")
$null = $sb.AppendLine("    });")
$null = $sb.AppendLine("  });")
$null = $sb.AppendLine("});")

[System.IO.File]::WriteAllText($outputFile, $sb.ToString(), [System.Text.Encoding]::UTF8)

Write-Host "Done! products-data.js written with $($allProducts.Count) products."
Write-Host ""
Write-Host "Category breakdown:"
foreach ($catKey in $catalog.Keys) {
    $c = $catalog[$catKey]
    $total = ($c.subcategories | ForEach-Object { $_.products.Count } | Measure-Object -Sum).Sum
    Write-Host "  $($c.name): $total products across $($c.subcategories.Count) subcategories"
}
