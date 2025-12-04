import JSZip from "jszip";
import { saveAs } from "file-saver";

export async function downloadZip(
  profileImage: string,
  galleryImages: string[],
  sourceImageFile: File,
  styleName: string,
  coupleName: string
) {
  const zip = new JSZip();
  const folder = zip.folder("couplai-profile");
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

  // 3. Add Gallery Images
  const galleryPaths: string[] = [];
  for (let i = 0; i < galleryImages.length; i++) {
    const url = galleryImages[i];
    const fileName = `gallery-${i + 1}.png`;

    let blob: Blob;
    if (url.startsWith("data:")) {
      blob = await (await fetch(url)).blob();
    } else {
      blob = await (await fetch(url)).blob();
    }

    folder.file(fileName, blob);
    galleryPaths.push(fileName);
  }

  // 4. Generate HTML
  const htmlContent = generateProfileHtml(
    profileFileName,
    galleryPaths,
    styleName,
    coupleName
  );
  folder.file("index.html", htmlContent);

  // Generate and Save
  const content = await zip.generateAsync({ type: "blob" });

  const safeName = coupleName.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  const fileName = `${safeName}-profile.zip`;

  saveAs(content, fileName);
}

function generateProfileHtml(
  profilePath: string,
  galleryPaths: string[],
  styleName: string,
  coupleName: string
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${coupleName} - ${styleName}</title>
    <style>
        :root { --primary: #FF69B4; --bg: #f8f9fa; }
        body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg); margin: 0; padding: 0; color: #333; }
        .container { max-width: 1000px; margin: 40px auto; background: #fff; border-radius: 30px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
        
        .header-bg { height: 200px; background: linear-gradient(135deg, #FFB7C5, #E0BBE4, #A0D8EF); }
        
        .profile-section { text-align: center; margin-top: -100px; padding-bottom: 40px; }
        .profile-img-container { width: 200px; height: 200px; margin: 0 auto; border-radius: 50%; padding: 5px; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.15); }
        .profile-img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary); }
        
        .info { margin-top: 20px; padding: 0 20px; }
        h1 { margin: 0; font-size: 2.5em; color: #2d3748; letter-spacing: -1px; }
        .subtitle { color: var(--primary); font-weight: bold; text-transform: uppercase; letter-spacing: 2px; font-size: 0.9em; margin-top: 5px; }
        .bio { color: #718096; margin-top: 10px; max-width: 500px; margin-left: auto; margin-right: auto; line-height: 1.6; }
        
        .gallery-section { background: #fcfcfc; padding: 60px 40px; border-top: 1px solid #edf2f7; }
        .gallery-title { text-align: center; color: #cbd5e0; font-weight: bold; letter-spacing: 4px; font-size: 0.8em; margin-bottom: 40px; text-transform: uppercase; }
        
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 30px; }
        .card { border-radius: 20px; overflow: hidden; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: transform 0.3s ease; border: 1px solid #edf2f7; }
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
