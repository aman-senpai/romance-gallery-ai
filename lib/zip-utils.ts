import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadZip(
  profileImage: string,
  galleryHistory: string[][],
  currentIndices: number[],
  sourceImageFile: File,
  styleName: string,
  coupleName: string
) {
  // Create folder with user's name
  const safeName =
    coupleName.replace(/[^a-z0-9]/gi, "-").toLowerCase() || "couplai";
  const folderName = `${safeName}-profile`;

  const zip = new JSZip();
  const folder = zip.folder(folderName);
  if (!folder) throw new Error("Failed to create zip folder");

  // 1. Add Source Image
  const sourceFileName = `source-${sourceImageFile.name}`;
  folder.file(sourceFileName, sourceImageFile);

  // 2. Add Profile Image
  const profileFileName = "profile-generated.png";
  let profileBlob: Blob;
  if (profileImage.startsWith("data:")) {
    profileBlob = await (await fetch(profileImage)).blob();
  } else {
    profileBlob = await (await fetch(profileImage)).blob();
  }
  folder.file(profileFileName, profileBlob);

  // 3. Add Gallery Images (All History)
  const activeGalleryPaths: string[] = [];

  for (let i = 0; i < galleryHistory.length; i++) {
    const history = galleryHistory[i];
    const currentIndex = currentIndices[i];

    // Process all versions
    for (let version = 0; version < history.length; version++) {
      const url = history[version];
      // Naming convention: gallery-{slot}-v{version}.png
      const fileName = `gallery-${i + 1}-v${version + 1}.png`;

      // If this is the active version, add it to the list for HTML
      if (version === currentIndex) {
        activeGalleryPaths.push(fileName);
      }

      let blob: Blob;
      if (url.startsWith("data:")) {
        blob = await (await fetch(url)).blob();
      } else {
        blob = await (await fetch(url)).blob();
      }

      folder.file(fileName, blob);
    }
  }

  // 4. Generate HTML (Light)
  const htmlContentLight = generateProfileHtml(
    profileFileName,
    activeGalleryPaths,
    styleName,
    coupleName,
    "light"
  );
  folder.file("profile-light.html", htmlContentLight);

  // 5. Generate HTML (Dark)
  const htmlContentDark = generateProfileHtml(
    profileFileName,
    activeGalleryPaths,
    styleName,
    coupleName,
    "dark"
  );
  folder.file("profile-dark.html", htmlContentDark);

  // Generate and Save
  const content = await zip.generateAsync({ type: "blob" });
  const zipFileName = `${safeName}-profile.zip`;

  saveAs(content, zipFileName);
}

function generateProfileHtml(
  profilePath: string,
  galleryPaths: string[],
  styleName: string,
  coupleName: string,
  theme: "light" | "dark" = "light"
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${coupleName} - ${styleName} (${
    theme === "light" ? "Light" : "Dark"
  })</title>
    <style>
        :root {
            --primary: #FF69B4;
            --bg: ${theme === "light" ? "#f8f9fa" : "#1a1a1a"};
            --card-bg: ${theme === "light" ? "#ffffff" : "#262626"};
            --text-main: ${theme === "light" ? "#333333" : "#f3f4f6"};
            --text-sub: ${theme === "light" ? "#718096" : "#a0aec0"};
            --card-shadow: ${
              theme === "light" ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.5)"
            };
            --border-color: ${theme === "light" ? "#edf2f7" : "#404040"};
        }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg); margin: 0; padding: 0; color: var(--text-main); transition: background 0.3s, color 0.3s; }
        .container { max-width: 1000px; margin: 40px auto; background: var(--card-bg); border-radius: 30px; overflow: hidden; box-shadow: 0 20px 60px var(--card-shadow); }
        
        .header-bg { height: 200px; background: linear-gradient(135deg, #FFB7C5, #E0BBE4, #A0D8EF); }
        
        .profile-section { text-align: center; margin-top: -100px; padding-bottom: 40px; }
        .profile-img-container { width: 200px; height: 200px; margin: 0 auto; border-radius: 50%; padding: 5px; background: var(--card-bg); box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .profile-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary); }
        
        .info { margin-top: 20px; padding: 0 20px; }
        h1 { margin: 0; font-size: 2.5em; color: var(--text-main); letter-spacing: -1px; }
        .subtitle { color: var(--primary); font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 0.9em; margin-top: 5px; }
        .bio { color: var(--text-sub); margin-top: 10px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.6; }
        
        .gallery-section { background: var(--bg); padding: 60px 40px; border-top: 1px solid var(--border-color); }
        .gallery-title { text-align: center; color: #cbd5e0; font-weight: bold; letter-spacing: 4px; font-size: 0.8em; margin-bottom: 40px; text-transform: uppercase; }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; }
        .card { border-radius: 20px; overflow: hidden; background: var(--card-bg); box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.3s ease; border: 1px solid var(--border-color); }
        .card:hover { transform: translateY(-10px); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .card-img { width: 100%; aspect-ratio: 4/5; object-fit: cover; display: block; }
        
        @media (max-width: 768px) {
            .container { margin: 0; border-radius: 0; }
            .grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header-bg"></div>
        
        <div class="profile-section">
            <div class="profile-img-container">
                <img src="${profilePath}" alt="Profile" class="profile-img">
            </div>
            <div class="info">
                <h1>${coupleName}</h1>
                <div class="subtitle">${styleName} Collection</div>
                <div class="bio">✨ A celebration of love, reimagined through the lens of AI art. Generated with CouplAI.</div>
            </div>
        </div>

        <div class="gallery-section">
            <div class="gallery-title">Gallery Highlights</div>
            <div class="grid">
                ${galleryPaths
                  .map(
                    (path) => `
                <div class="card">
                    <img src="${path}" class="card-img" loading="lazy">
                </div>
                `
                  )
                  .join("")}
            </div>
        </div>
    </div>
</body>
</html>
  `;
}
