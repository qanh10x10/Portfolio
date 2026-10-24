# Hardware Team 3D Assets: Provenance & Attribution

This directory contains the normalized glTF JSON (`.json`), binary buffer (`.data`), and separated texture files for the 3 hardware workstation models.

---

## 1. Gaming Chair
- **Title**: Gaming Chair
- **Author**: PixelPlay (https://sketchfab.com/PixelPlay)
- **Source**: https://sketchfab.com/3d-models/gaming-chair-828ec54fabde46a8900fadf64c05433b
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0) (http://creativecommons.org/licenses/by/4.0/)
- **Original Format**: GLB binary (13,276,424 bytes, 73 nodes, 39 meshes, 122,530 triangles, 11 textures)
- **Modifications**:
  - Extracted to glTF JSON (`gaming-chair.json`), external binary buffer (`gaming-chair.data`), and separate JPG/PNG textures.
  - Geometry untouched (100% vertex/triangle fidelity preserved).
  - Normalization runtime transform rotates +47.09 deg to align forward with +z, centers seat cushion at x=0, z=0, and uniformly scales to floor y=0.0155 (rug top) and usable seat cushion contact y=0.6800 matching IronMan seated posture.

---

## 2. Gaming Desktop PC
- **Title**: Gaming Desktop PC
- **Author**: Yolala1232 (https://sketchfab.com/Yolala1232)
- **Source**: https://sketchfab.com/3d-models/gaming-desktop-pc-d1d8282c9916438091f11aeb28787b66
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0) (http://creativecommons.org/licenses/by/4.0/)
- **Original Format**: GLB binary (12,068,496 bytes, 1,514 nodes, 685 meshes, 86,272 triangles, 51 textures)
- **Modifications**:
  - Extracted to glTF JSON (`gaming-desktop.json`), external binary buffer (`gaming-desktop.data`), and separate JPG/PNG textures.
  - Model authored in decimeters; normalized at scale 0.1 to meters with monitor screen facing +z and keyboard in front.
  - Exposes authored monitor screen mesh (`MY_SCREEN_MY_SCREEN_0`, width 0.632m, height 0.347m) for overlay integration.
  - Safe static draw-call merge optimization combines same-material static meshes using Three.js `BufferGeometryUtils.mergeGeometries`, reducing 685 draw calls to 86 without losing any triangles (exact 86,272 triangles preserved).
  - Duplicate desk slab (`Cube_Material_0`) can be toggled via `includeDesk` parameter so the setup can rest cleanly on the room's existing desk.

---

## 3. Japanese Bulletin Board 01
- **Title**: Japanese Bulletin Board 01
- **Author**: Nichgon (https://sketchfab.com/nichgon)
- **Source**: https://sketchfab.com/3d-models/japanese-bulletin-board-01-44c982a5367d4af8b845c7494ee55e6b
- **License Notice**:
  - Source Sketchfab web page specifies: **License: CC0** and **Free Standard**.
  - Embedded GLB metadata specifies: **SKETCHFAB Standard (https://sketchfab.com/licenses)**.
  - **Status**: Allowed for private preview in this checkpoint; PO / legal check required before public production deployment. Neither claimed as CC BY nor re-licensed.
- **Original Format**: GLB binary (4,179,912 bytes, 5 nodes, 1 mesh, 1,662 triangles, 3 textures)
- **Modifications**:
  - Extracted to glTF JSON (`bulletin-board.json`), external binary buffer (`bulletin-board.data`), and separate PNG textures.
  - Geometry untouched (1,662 triangles).
  - `board-cork.webp` crops the original atlas's unprinted cork; `board-resume.webp` retains that atlas's wood/hardware and replaces only the measured front UV island with the rendered Resume papers so home/focus share the same visual identity.
  - Faces +z front, outer dimensions 0.900m wide x 0.614m high x 0.030m deep, cork content surface plane at z=0.022m (0.900m x 0.600m).
