# 🔄 EMBEDDING-ATLAS UPSTREAM UPDATE

**Date**: March 15, 2026  
**Status**: ✅ **UPDATED TO v0.18.1**  

---

## 📦 UPSTREAM CHANGES PULLED

**Repository**: https://github.com/apple/embedding-atlas  
**Previous Version**: v0.18.0  
**New Version**: v0.18.1  

### New Commits (3):
```
148c71e (HEAD -> main, tag: v0.18.1) chore: bump version to 0.18.1 (#172)
aacf1b0 fix: minor MCP-related issues (#171)
c8f714e fix: table header backdrop-blur may not work (#168)
```

### Changes Summary:
1. **Version bump to 0.18.1** - Release tagging
2. **MCP fixes** - Minor MCP-related issue resolutions
3. **UI fix** - Table header backdrop-blur CSS fix

---

## 🔧 REBUILD STATUS

### embedding-atlas Build:
```
✓ built in 1m 6s

dist/search.worker.js         72.19 kB
dist/clustering.worker.js    255.32 kB
dist/viewer.js                 0.14 kB │ gzip:   0.14 kB
dist/component.js              0.19 kB │ gzip:   0.16 kB
dist/index.js                  0.49 kB │ gzip:   0.28 kB
dist/react.js                  1.08 kB │ gzip:   0.53 kB
dist/chunk-DgFtVqg1.js         1.84 kB │ gzip:   0.71 kB
dist/chunk-CcmG315c.js        13.62 kB │ gzip:   3.07 kB
dist/chunk-Cym-eLtO.js        13.77 kB │ gzip:   3.09 kB
dist/chunk-fa8UlHZE.js       198.05 kB │ gzip:  17.60 kB
dist/chunk-CBGfwhHd.js       226.63 kB │ gzip:  59.54 kB
dist/chunk-QTU8Uj2V.js       240.35 kB │ gzip:  94.32 kB
dist/umap.js                 793.03 kB │ gzip: 309.84 kB
dist/chunk-BQqG3oRO.js     2,648.47 kB │ gzip: 736.31 kB
```

### reporemix-client Build:
```
✓ built in 21.27s

dist/index.html                                0.39 kB │ gzip:     0.26 kB
dist/assets/search.worker-DcoMp7gs.js         50.12 kB
dist/assets/clustering.worker-DUvbjKXD.js    249.91 kB
dist/assets/index-D4-b2yZF.css                20.87 kB │ gzip:     4.89 kB
dist/assets/chunk-CcmG315c-CtXqEfOf.js        13.66 kB │ gzip:     3.07 kB
dist/assets/chunk-Cym-eLtO-CeWfMd8a.js        13.80 kB │ gzip:     3.10 kB
dist/assets/chunk-fa8UlHZE-CDWIPFKx.js       198.07 kB │ gzip:    17.80 kB
dist/assets/index-ZnxVwBxp.js              3,407.67 kB │ gzip: 1,158.37 kB
```

---

## 📊 BUILD METRICS

| Metric | Before (v0.18.0) | After (v0.18.1) | Change |
|--------|------------------|-----------------|--------|
| **embedding-atlas Build Time** | 53.44s | 1m 6s | +12.56s |
| **reporemix Build Time** | 13.38s | 21.27s | +7.89s |
| **Total Bundle Size** | 3,407.67 KB | 3,407.67 KB | No change |
| **Gzipped Size** | 1,158.37 KB | 1,158.37 KB | No change |
| **Chunks** | 8 | 8 | Same |
| **Workers** | 2 | 2 | Same |

---

## ✅ VERIFICATION

### Check Version:
```bash
cd /Volumes/OMNI_01/70_CLONED_REPOS/embedding-atlas-fresh
git describe --tags --abbrev=0
# Output: v0.18.1
```

### Check Build:
```bash
cd /Volumes/OMNI_01/70_CLONED_REPOS/reporemix/client
npm run build
# ✓ built in 21.27s
```

### Test in Browser:
```bash
npm run preview
# Open http://localhost:4173
# Verify embedding visualization works
# Check MCP-related features
# Test table header backdrop-blur
```

---

## 🔗 COMMIT HISTORY

### embedding-atlas (Apple's repo):
```
v0.18.1 (latest)
├─ 148c71e chore: bump version to 0.18.1 (#172)
├─ aacf1b0 fix: minor MCP-related issues (#171)
└─ c8f714e fix: table header backdrop-blur may not work (#168)

v0.18.0 (previous)
└─ 98b7008 chore: bump version to 0.18.0 (#167)
```

---

## 📝 LOCAL CHANGES

### embedding-atlas-fresh (local fork):
- ✅ Pulled latest from upstream (apple/embedding-atlas)
- ✅ Reset to match origin/main (v0.18.1)
- ✅ Rebuilt package
- ✅ .gitignore updated (node_modules/, dist/, *.log)

### reporemix (local fork):
- ✅ Rebuilt with updated embedding-atlas
- ✅ Production build verified
- ✅ 0 vulnerabilities in production deps

---

## 🚀 NEXT STEPS

### Optional - Commit embedding-atlas update:
```bash
cd /Volumes/OMNI_01/70_CLONED_REPOS/embedding-atlas-fresh
git add -A
git commit -m "chore: Update to v0.18.1 from upstream

- Pulled 3 new commits from apple/embedding-atlas
- MCP-related fixes (#171)
- Table header backdrop-blur fix (#168)
- Rebuilt dist/ folder

Upstream: https://github.com/apple/embedding-atlas/releases/tag/v0.18.1"
```

### Optional - Update reporemix:
```bash
cd /Volumes/OMNI_01/70_CLONED_REPOS/reporemix
git add -A
git commit -m "chore: Rebuild with embedding-atlas v0.18.1

- Updated embedding-atlas dependency to v0.18.1
- Includes MCP fixes and backdrop-blur fix
- Build time: 21.27s
- Bundle size: 3.4 MB (1.16 MB gzipped)"
git push origin main
```

---

## 📌 SUMMARY

**embedding-atlas Version**: ✅ **v0.18.1** (latest)  
**Build Status**: ✅ **Successful**  
**Bundle Size**: ✅ **No change** (3.4 MB)  
**Build Time**: ⚠️ **+7.89s** (21.27s total)  
**Production Security**: ✅ **0 vulnerabilities**

---

**Upstream update complete!** 🚀

**Godspeed! 🚀**
