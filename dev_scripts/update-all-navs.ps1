
# update-all-navs.ps1
# Replaces the entire hardcoded <nav class="bb-nav">...</nav> block in each HTML file
# with a bare <nav class="bb-nav"></nav> that nav.js will populate.
# Also injects the products-data.js and nav.js script tags before </body>.

$siteRoot = "e:\zaliSiteFinal"
$files = @(
    "about.html",
    "contact.html",
    "fabrics.html",
    "faq.html",
    "how-it-works.html",
    "index.html",
    "print-methods.html",
    "sample-pack.html"
)

foreach ($file in $files) {
    $path = "$siteRoot\$file"
    if (-not (Test-Path $path)) { Write-Warning "Not found: $path"; continue }

    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

    # Replace the nav block: from <nav class="bb-nav"> ... </nav> (greedy to last </nav> in nav)
    # We use a pattern that captures everything between <nav class="bb-nav"> and the NEXT closing </nav>
    # that follows the closing </div></div></div></nav> pattern

    # Strategy: find <nav class="bb-nav"> and its matching </nav>
    $navOpen  = '<nav class="bb-nav">'
    $navClose = '</nav>'

    $startIdx = $content.IndexOf($navOpen)
    if ($startIdx -lt 0) {
        Write-Warning "$file : no <nav class='bb-nav'> found"
        continue
    }

    # Find end of nav block — count opening/closing nav tags
    $searchFrom = $startIdx + $navOpen.Length
    $depth = 1
    $pos = $searchFrom
    while ($depth -gt 0 -and $pos -lt $content.Length) {
        $nextOpen  = $content.IndexOf('<nav', $pos)
        $nextClose = $content.IndexOf('</nav>', $pos)
        if ($nextClose -lt 0) { break }
        if ($nextOpen -ge 0 -and $nextOpen -lt $nextClose) {
            $depth++
            $pos = $nextOpen + 4
        } else {
            $depth--
            if ($depth -eq 0) {
                $endIdx = $nextClose + $navClose.Length
                break
            }
            $pos = $nextClose + $navClose.Length
        }
    }

    if ($depth -ne 0) {
        Write-Warning "$file : could not find matching </nav>"
        continue
    }

    $replacement = '<nav class="bb-nav"></nav>'
    $content = $content.Substring(0, $startIdx) + $replacement + $content.Substring($endIdx)

    # Inject script tags before </body> if not already present
    if ($content -notmatch 'products-data\.js') {
        $inject = "`n<script src=`"products-data.js`"></script>`n<script src=`"nav.js`"></script>"
        $content = $content -replace '</body>', "$inject`n</body>"
    }

    [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Updated: $file"
}

Write-Host "`nAll done!"
