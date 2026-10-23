# Model Provenance and Licensing: Sleeping Cat & Bean Bag

This directory contains 3D assets adapted for the HollowGameArchive 3D portfolio scene.

## 1. Cat: "3d modelling my cat: Fripouille"
- **Title**: 3d modelling my cat: Fripouille
- **Author**: guillaume bolis (https://sketchfab.com/guillaume.bolis.neko)
- **Source**: https://sketchfab.com/3d-models/3d-modelling-my-cat-fripouille-0ab14bf98e754f8d90fe1bf1c84ca66c
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0) (http://creativecommons.org/licenses/by/4.0/)
- **Modifications**:
  - Extracted binary GLB into glTF 2.0 JSON (`cat.json`) + binary buffer (`cat.data`) + individual texture images (`cat-eye.png`, `cat-frip-diffuse.png`, `cat-frip-orm.png`, `cat-frip-normal.png`) for production server compatibility without .glb MIME requirement.
  - Retained the original 34-joint skeleton, inverse bind matrices, body topology and textures. Corrected the body mesh's exported -100x coordinate mismatch and reversed triangle winding to preserve surface orientation.
  - Posed the source rig into a fixed side-resting posture on the supplied beanbag. Detached eyeball/whisker meshes are hidden for sleep; the body texture supplies the closed-eye crease. No procedural substitute animal is used.

## 2. Bean Bag: "Simple Bean Bag"
- **Title**: Simple Bean Bag
- **Author**: AleixoAlonso (https://sketchfab.com/AleixoAlonso)
- **Source**: https://sketchfab.com/3d-models/simple-bean-bag-64d111cec3d842f09cbb8c68b1e49c8d
- **License**: Creative Commons Attribution 4.0 International (CC BY 4.0) (http://creativecommons.org/licenses/by/4.0/)
- **Modifications**:
  - Extracted binary GLB into glTF 2.0 JSON (`beanbag.json`) + binary buffer (`beanbag.data`) + individual texture images (`beanbag-diffuse.png`, `beanbag-orm.png`, `beanbag-normal.png`).
  - Centered pivot and normalized floor placement so the base rests on the room rug surface (y = 0.0155 m).
