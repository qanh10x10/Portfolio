import React from 'react';
import Icon from './Icon.jsx';

export const PROJECT_DETAILS = {
  "surviver": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="surviver">


                <div className="project-gallery">
                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/SurvivorIO/Image Sequence_002_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/SurvivorIO/Image Sequence_002_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/SurvivorIO/Image Sequence_003_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                        src="/assets/images/game/SurvivorIO/Image Sequence_003_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/SurvivorIO/Image Sequence_004_0000.png", alt: " screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                        src="/assets/images/game/SurvivorIO/Image Sequence_004_0000.png"
                          loading="lazy" alt=" screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/SurvivorIO/Image Sequence_005_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                        src="/assets/images/game/SurvivorIO/Image Sequence_005_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/SurvivorIO/Image Sequence_006_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                        src="/assets/images/game/SurvivorIO/Image Sequence_006_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>

                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/SurvivorIO/Image Sequence_007_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                        src="/assets/images/game/SurvivorIO/Image Sequence_007_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>



                </div>

                <div className="title-wrapper">
                  <div className="icon-box">
                    <Icon name="book-outline"  />
                  </div>
                  <h3 className="h3">Zombie Survivor: IO</h3>
                </div>
                <ul className="timeline-list">
                  <li className="timeline-item">
                    <span>2021 — 2022</span>
                    <p className="timeline-text description">
                      <strong>Zombie Survivor: IO</strong> is a fast-paced action-survival roguelike where players battle endless hordes of zombies using auto-firing weapons and evolving skills. With intense bullet-hell gameplay and randomly generated upgrades, each run delivers a thrilling fight for survival.
                    </p>
                  </li>

                  <li className="timeline-item">
                    <h1 className="h4 timeline-item-title">Key Features:</h1>
                    <ul className="timeline-description-list">
                      <li className="timeline-description">
                        <p className="timeline-text description">🧟 <strong>Zombie Horde Combat:</strong> Face thousands of zombies swarming in waves, with increasing difficulty over time.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🔫 <strong>Auto-Attack Mechanics:</strong> Focus on movement while your hero auto-fires with equipped weapons.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">⚡ <strong>Skill Evolution System:</strong> Combine random upgrades during battle to unlock powerful synergies.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🧬 <strong>Hero Progression:</strong> Level up your hero with gear, talents, and permanent stat boosts.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🌆 <strong>Dynamic Stages:</strong> Battle across different urban maps with unique obstacles and enemy types.</p>
                      </li>
                    </ul>
                  </li>

                  <li className="timeline-item">
                    <h1 className="h4 timeline-item-title">My Role:</h1>
                    <ul className="timeline-description-list">
                      <li className="timeline-description">
                        <p className="timeline-text description">👨‍💻 Solo developed core game systems including auto-attack logic, enemy wave generation, and skill upgrade mechanics.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🧠 Designed random upgrade system with skill-tree synergy logic to support replayability.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🎮 Created multiple maps with dynamic spawn zones and environmental hazards.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">📱 Implemented mobile-friendly UI and optimized controls for one-handed gameplay.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">📊 Integrated analytics, ads, and in-app purchase systems for monetization and user tracking.</p>
                      </li>
                    </ul>
                  </li>
                </ul>


                <section className="service">
                  <ul className="service-list">



                    <a className="service-item" href="/Games/SurvivorIO/index.html">
                      <div className="service-icon-box">
                        <img src="/assets/images/game/SurvivorIO/Mission_022.png" alt="Demo" width="40" />
                      </div>
                      <div className="service-content-box">
                        <h4 className="h4 service-item-title">Play Game (WebGL)</h4>
                      </div>
                    </a>

                    <a className="service-item" href="https://apps.apple.com/us/app/survivor-io/id1528941310?l">
                      <div className="service-icon-box">
                        <img src="/assets/images/AppStore-Icons.svg" alt="Demo" width="40" />
                      </div>
                      <div className="service-content-box">
                        <h4 className="h4 service-item-title">Play Game IOS</h4>
                      </div>
                    </a>
                  </ul>
                </section>


    </section>
  ),
  "tilecandy": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="tilecandy">

              <ul className="project-list">

              </ul>


              <div className="project-gallery">



                <div className="project-item active" >
                  <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/TileCandy/Image Sequence_001_0000.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                    <figure className="project-img">
                      <img
                        src="/assets/images/game/TileCandy/Image Sequence_001_0000.jpg"
                        loading="lazy" alt="screenshot 1"/>
                    </figure>
                  </button>
                </div>


                <div className="project-item active" >
                  <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/TileCandy/Image Sequence_002_0000.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                    <figure className="project-img">
                      <img
                      src="/assets/images/game/TileCandy/Image Sequence_002_0000.jpg"
                        loading="lazy" alt="screenshot 1"/>
                    </figure>
                  </button>
                </div>



                <div className="project-item active" >
                  <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/TileCandy/Image Sequence_004_0000.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                    <figure className="project-img">
                      <img
                      src="/assets/images/game/TileCandy/Image Sequence_004_0000.jpg"
                        loading="lazy" alt="screenshot 1"/>
                    </figure>
                  </button>
                </div>


                <div className="project-item active" >
                  <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/TileCandy/Image Sequence_005_0000.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                    <figure className="project-img">
                      <img
                      src="/assets/images/game/TileCandy/Image Sequence_005_0000.jpg"
                        loading="lazy" alt="screenshot 1"/>
                    </figure>
                  </button>
                </div>

                <div className="project-item active" >
                  <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/TileCandy/Image Sequence_007_0000.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                    <figure className="project-img">
                      <img
                      src="/assets/images/game/TileCandy/Image Sequence_007_0000.jpg"
                        loading="lazy" alt="screenshot 1"/>
                    </figure>
                  </button>
                </div>

                <div className="project-item active" >
                  <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/TileCandy/Image Sequence_008_0000.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                    <figure className="project-img">
                      <img
                      src="/assets/images/game/TileCandy/Image Sequence_008_0000.jpg"
                        loading="lazy" alt="screenshot 1"/>
                    </figure>
                  </button>
                </div>




              </div>

              <div className="title-wrapper">
                <div className="icon-box">
                  <Icon name="book-outline"  />
                </div>
                <h3 className="h3">Tile Candy!</h3>
              </div>
              <ul className="timeline-list">
                <li className="timeline-item">
                  <span>2020 — 2021</span>
                  <p className="timeline-text description">
                    <strong>Tiles Candy!</strong> is a sweet and addictive tile-matching puzzle game where players must match 3 identical candy tiles to clear them from the board. With hundreds of levels and colorful visuals, the game delivers a relaxing yet challenging experience perfect for casual players.
                  </p>
                </li>

                <li className="timeline-item">
                  <h1 className="h4 timeline-item-title">Key Features:</h1>
                  <ul className="timeline-description-list">
                    <li className="timeline-description">
                      <p className="timeline-text description">🍬 <strong>Match 3 Gameplay:</strong> Match 3 identical tiles to remove them and progress through candy-themed levels.</p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">🧠 <strong>Strategic Tile Stacking:</strong> Think ahead to manage your tile slots and avoid a game over.</p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">🎨 <strong>Colorful Candy Graphics:</strong> Eye-catching UI with vibrant candy visuals and animations.</p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">📱 <strong>Casual Friendly:</strong> Easy to pick up, with increasing difficulty to keep players engaged.</p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">💡 <strong>Level Progression:</strong> Hundreds of hand-crafted levels with unique tile layouts.</p>
                    </li>
                  </ul>
                </li>

                <li className="timeline-item">
                  <h1 className="h4 timeline-item-title">My Role:</h1>
                  <ul className="timeline-description-list">
                    <li className="timeline-description">
                      <p className="timeline-text description">👨‍💻 Solo integrated full game logic including tile matching, slot management, and level progression system.</p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">🎨 Customized UI layout and animations to improve game feel and visual feedback.</p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">📈 Implemented daily reward system and hint boosters to enhance player retention.</p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">🔧 Optimized game performance and tested compatibility across a wide range of Android/iOS devices.</p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">🚀 Handled full publishing pipeline from build to app store submission and live updates.</p>
                    </li>
                  </ul>
                </li>
              </ul>



              <section className="service">
                <ul className="service-list">

                  <a className="service-item" href="/Games/TileCandy/index.html">
                    <div className="service-icon-box">
                      <img src="/assets/images/game/TileCandy/candy_logo.png" alt="Demo" width="40" />
                    </div>
                    <div className="service-content-box">
                      <h4 className="h4 service-item-title">Play Game (WebGL)</h4>
                    </div>
                  </a>


                </ul>
              </section>


    </section>
  ),
  "bike": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="bike">

                <ul className="project-list">

                </ul>


                <div className="project-gallery">



                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/BikeTrail/Image Sequence_001_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/BikeTrail/Image Sequence_001_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/BikeTrail/Image Sequence_002_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                        src="/assets/images/game/BikeTrail/Image Sequence_002_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/BikeTrail/Image Sequence_003_0000.png", alt: " screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/BikeTrail/Image Sequence_003_0000.png"
                          loading="lazy" alt=" screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/BikeTrail/Image Sequence_004_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/BikeTrail/Image Sequence_004_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/BikeTrail/Image Sequence_005_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/BikeTrail/Image Sequence_005_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>

                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/BikeTrail/Image Sequence_006_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/BikeTrail/Image Sequence_006_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>

                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/BikeTrail/Image Sequence_007_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/BikeTrail/Image Sequence_007_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>

                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/BikeTrail/Image Sequence_008_0000.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/BikeTrail/Image Sequence_008_0000.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>

                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/BikeTrail/BG.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/BikeTrail/BG.jpg"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                </div>

                <div className="title-wrapper">
                  <div className="icon-box">
                    <Icon name="book-outline"  />
                  </div>
                  <h3 className="h3">Rise of trial bike</h3>
                </div>
                <ul className="timeline-list">
                  <li className="timeline-item">
                    <span>2021 — 2022</span>
                    <p className="timeline-text description">
                      <strong>Rise of Trial Bike</strong> is a thrilling and physics-based motorbike stunt game where players ride across extreme terrains filled with obstacles, ramps, and gaps. The game challenges players to balance speed and precision to perform spectacular stunts while reaching the finish line.
                    </p>
                  </li>

                  <li className="timeline-item">
                    <h1 className="h4 timeline-item-title">Key Features:</h1>
                    <ul className="timeline-description-list">
                      <li className="timeline-description">
                        <p className="timeline-text description">🏍️ <strong>Extreme Bike Stunts:</strong> Perform flips, wheelies, and airborne tricks across challenging courses.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🗺️ <strong>Dynamic Level Design:</strong> Navigate through a variety of handcrafted levels with increasing difficulty.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🎮 <strong>Responsive Controls:</strong> Smooth and intuitive touch-based controls for an immersive gameplay experience.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">📱 <strong>Optimized for Mobile:</strong> Designed to run smoothly on both iOS and Android devices.</p>
                      </li>
                    </ul>
                  </li>

                  <li className="timeline-item">
                    <h1 className="h4 timeline-item-title">My Role:</h1>
                    <ul className="timeline-description-list">
                      <li className="timeline-description">
                        <p className="timeline-text description">👨‍💻 Solo developed the entire project including physics-based bike controller and level progression system.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🎨 Designed and implemented all UI/UX elements for menu navigation, gameplay HUD, and result screens.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🔧 Integrated realistic physics and particle effects for impactful gameplay feedback.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🚀 Published and maintained the game on multiple platforms, ensuring stability and performance updates.</p>
                      </li>
                    </ul>
                  </li>
                </ul>


                <section className="service">
                  <ul className="service-list">

                    <a className="service-item" href="https://bike-trial.web.app/">
                      <div className="service-icon-box">
                        <img src="/assets/images/game/BikeTrail/BG Game.jpg" alt="Demo" width="40" />
                      </div>
                      <div className="service-content-box">
                        <h4 className="h4 service-item-title">Play Game (WebGL)</h4>
                      </div>
                    </a>

                    <a className="service-item" href="https://apps.apple.com/ca/app/trial-bike-extreme-stunts/id1546972713">
                      <div className="service-icon-box">
                        <img src="/assets/images/AppStore-Icons.svg" alt="Demo" width="40" />
                      </div>
                      <div className="service-content-box">
                        <h4 className="h4 service-item-title">Play Game IOS</h4>
                      </div>
                    </a>

                  </ul>
                </section>


    </section>
  ),
  "archero": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="archero">

                <ul className="project-list">

                </ul>
                <section className="video-demo">
                  <h4 className="h4">🎥 Gameplay Trailer</h4>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>

                    <video width="50%" controls autoPlay muted loop style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.2)", maxWidth: "960px" }}>
                      <source src="/assets/images/game/Archero/Movie_003.mp4" type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </section>

                <div className="project-gallery">



                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Archero/1.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/Archero/1.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Archero/2.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                        src="/assets/images/game/Archero/2.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Archero/3.png", alt: " screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/Archero/3.png"
                          loading="lazy" alt=" screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Archero/4.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/Archero/4.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Archero/5.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/Archero/5.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>

                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Archero/6.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/Archero/6.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>

                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Archero/7.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/Archero/7.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>

                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Archero/8.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/Archero/8.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>

                  <div className="project-item active" >
                    <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Archero/9.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                      <figure className="project-img">
                        <img
                          src="/assets/images/game/Archero/9.png"
                          loading="lazy" alt="screenshot 1"/>
                      </figure>
                    </button>
                  </div>


                </div>

                <div className="title-wrapper">
                  <div className="icon-box">
                    <Icon name="book-outline"  />
                  </div>
                  <h3 className="h3">Archero</h3>
                </div>
                <ul className="timeline-list">
                  <li className="timeline-item">
                    <span>2020 — 2021</span>
                    <p className="timeline-text description">
                      <strong>Arrow Survival: Hero's Quest</strong> is a fast-paced action roguelike where players take on the role of a lone archer battling through waves of enemies across procedurally generated stages. With intuitive one-touch controls and an arsenal of unique skills and upgrades, the game delivers an intense survival experience.
                    </p>
                  </li>

                  <li className="timeline-item">
                    <h1 className="h4 timeline-item-title">Key Features:</h1>
                    <ul className="timeline-description-list">
                      <li className="timeline-description">
                        <p className="timeline-text description">🏹 <strong>One-Finger Archery Combat:</strong> Move to dodge and release to fire—simple yet deeply strategic controls.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🧿 <strong>Randomized Skill System:</strong> Gain random power-ups after each room for endless combinations.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🌍 <strong>Procedurally Generated Levels:</strong> Each run offers fresh layouts and enemy encounters.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">👹 <strong>Challenging Boss Battles:</strong> Face epic bosses with unique mechanics and attacks.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🧙 <strong>Hero & Gear Progression:</strong> Unlock new heroes and upgrade weapons, armor, and abilities.</p>
                      </li>
                    </ul>
                  </li>

                  <li className="timeline-item">
                    <h1 className="h4 timeline-item-title">My Role:</h1>
                    <ul className="timeline-description-list">
                      <li className="timeline-description">
                        <p className="timeline-text description">👨‍💻 Solo developed the entire game including combat system, level generation, and enemy AI.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🎮 Designed intuitive touch control mechanics optimized for mobile gameplay.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🧠 Implemented random skill selection system with synergies for roguelike experience.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">📊 Integrated player progression systems including hero unlocks, gear upgrades, and monetization flow.</p>
                      </li>
                      <li className="timeline-description">
                        <p className="timeline-text description">🚀 Deployed and maintained the game with analytics, ads integration, and performance optimization.</p>
                      </li>
                    </ul>
                  </li>
                </ul>


                <section className="service">
                  <ul className="service-list">

                    <a className="service-item" href="/Games/Archero/index.html">
                      <div className="service-icon-box">
                        <img src="/assets/images/game/Archero/icon.png" alt="Demo" width="40" />
                      </div>
                      <div className="service-content-box">
                        <h4 className="h4 service-item-title">Play Game (WebGL)</h4>
                      </div>
                    </a>
                  </ul>
                </section>


    </section>
  ),
  "MeowFlow": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="MeowFlow">

            <ul className="project-list">

            </ul>
            <section className="video-demo">
              <h4 className="h4">🎥 Gameplay Trailer</h4>
              <div className="video-wrapper" style={{ marginTop: "12px" }}>

                <iframe
                  width="100%"
                  height="480"
                  src="https://www.youtube.com/embed/WXV-iMqmcpc"
                  title="Meow flow - Android Gameplay"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen>
                </iframe>
              </div>
            </section>

            <div className="project-gallery">



              <div className="project-item active" >
                <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MeowFlow/1.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                  <figure className="project-img">
                    <img
                      src="/assets/images/game/MeowFlow/1.webp"
                      loading="lazy" alt="screenshot 1"/>
                  </figure>
                </button>
              </div>


              <div className="project-item active" >
                <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MeowFlow/2.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                  <figure className="project-img">
                    <img
                    src="/assets/images/game/MeowFlow/2.webp"
                      loading="lazy" alt="screenshot 1"/>
                  </figure>
                </button>
              </div>


              <div className="project-item active" >
                <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MeowFlow/3.webp", alt: " screenshot 1" })} aria-label="View enlarged image">
                  <figure className="project-img">
                    <img
                      src="/assets/images/game/MeowFlow/3.webp"
                      loading="lazy" alt=" screenshot 1"/>
                  </figure>
                </button>
              </div>


              <div className="project-item active" >
                <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MeowFlow/4.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                  <figure className="project-img">
                    <img
                      src="/assets/images/game/MeowFlow/4.webp"
                      loading="lazy" alt="screenshot 1"/>
                  </figure>
                </button>
              </div>


              <div className="project-item active" >
                <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MeowFlow/5.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                  <figure className="project-img">
                    <img
                      src="/assets/images/game/MeowFlow/5.webp"
                      loading="lazy" alt="screenshot 1"/>
                  </figure>
                </button>
              </div>

              <div className="project-item active" >
                <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MeowFlow/6.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                  <figure className="project-img">
                    <img
                      src="/assets/images/game/MeowFlow/6.webp"
                      loading="lazy" alt="screenshot 1"/>
                  </figure>
                </button>
              </div>



            </div>

            <div className="title-wrapper">
              <div className="icon-box">
                <Icon name="book-outline"  />
              </div>
              <h3 className="h3">Meow flow : Cute Cat Games</h3>
            </div>
            <ul className="timeline-list">
              <li className="timeline-item">
                <span>2021 — 2022</span>
                <p className="timeline-text description">
                  <strong>Meow Flow</strong> is a charming and relaxing puzzle game where players connect matching cat-themed tiles to clear the board. With its cute visuals and soothing music, the game offers a delightful experience for players of all ages.
                </p>
              </li>

              <li className="timeline-item">
                <h1 className="h4 timeline-item-title">Key Features:</h1>
                <ul className="timeline-description-list">
                  <li className="timeline-description">
                    <p className="timeline-text description">🐾 <strong>Adorable Cat Themes:</strong> Enjoy a variety of cat-inspired tiles and backgrounds.</p>
                  </li>
                  <li className="timeline-description">
                    <p className="timeline-text description">🧩 <strong>Challenging Puzzles:</strong> Connect matching tiles without overlapping paths to solve each level.</p>
                  </li>
                  <li className="timeline-description">
                    <p className="timeline-text description">🎵 <strong>Relaxing Soundtrack:</strong> Soothing music enhances the calming gameplay experience.</p>
                  </li>
                  <li className="timeline-description">
                    <p className="timeline-text description">📱 <strong>Accessible Gameplay:</strong> Simple mechanics suitable for players of all skill levels.</p>
                  </li>
                </ul>
              </li>

              <li className="timeline-item">
                <h1 className="h4 timeline-item-title">My Role:</h1>
                <ul className="timeline-description-list">
                  <li className="timeline-description">
                    <p className="timeline-text description">👨‍💻 Developed core puzzle mechanics and implemented level progression system.</p>
                  </li>
                  <li className="timeline-description">
                    <p className="timeline-text description">🎨 Designed and integrated user interface elements for a seamless user experience.</p>
                  </li>
                  <li className="timeline-description">
                    <p className="timeline-text description">🔧 Optimized game performance across various devices to ensure smooth gameplay.</p>
                  </li>
                  <li className="timeline-description">
                    <p className="timeline-text description">📈 Integrated analytics tools to monitor player engagement and inform future updates.</p>
                  </li>
                </ul>
              </li>

            </ul>


            <section className="service">
              <ul className="service-list">

                <a className="service-item" href="https://play.google.com/store/apps/details?&id=com.falcon.p.blameo.meow.flow">
                  <div className="service-icon-box">
                    <img src="/assets/images/GooglePlay-Icon.svg" alt="Demo" width="40" />
                  </div>
                  <div className="service-content-box">
                    <h4 className="h4 service-item-title">Play Game Android</h4>
                  </div>
                </a>
              </ul>
            </section>


    </section>
  ),
  "sandwich": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="sandwich">

          <ul className="project-list">
          </ul>
          <section className="video-demo">
            <h4 className="h4">🎥 Gameplay Trailer</h4>
            <div className="video-wrapper" style={{ marginTop: "12px" }}>

              <iframe
                width="100%"
                height="480"
                src="https://www.youtube.com/embed/LoYwMs8mFsc"
                title="Sandwich Please! Game Gameplay Video for Android"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen>
              </iframe>
            </div>
          </section>

          <div className="project-gallery">



            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sanwitch/1.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Sanwitch/1.webp"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sanwitch/2.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                  src="/assets/images/game/Sanwitch/2.webp"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sanwitch/3.webp", alt: " screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Sanwitch/3.webp"
                    loading="lazy" alt=" screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sanwitch/4.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Sanwitch/4.webp"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sanwitch/5.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Sanwitch/5.webp"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>

            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sanwitch/6.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Sanwitch/6.webp"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>



          </div>

          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>
            <h3 className="h3">Sandwich Please!</h3>
          </div>
          <ul className="timeline-list">
            <li className="timeline-item">
              <span>2023 — 2024</span>
              <p className="timeline-text description">
                <strong>Sandwich Please!</strong> is a delightful idle simulation game where players manage a bustling sandwich shop. Starting with basic ingredients like bread and cheese, players can expand their menu, upgrade their shop, and serve a growing number of customers. The game offers a casual yet engaging experience, perfect for fans of time-management and tycoon games.
              </p>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Key Features:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">🥪 <strong>Idle Gameplay:</strong> Earn income even when offline, allowing continuous progress.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🍳 <strong>Menu Expansion:</strong> Unlock a variety of ingredients to create diverse sandwiches.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🏪 <strong>Shop Upgrades:</strong> Enhance your shop's equipment and decor to attract more customers.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">👥 <strong>Customer Management:</strong> Serve a variety of customers with unique preferences and increase satisfaction.</p>
                </li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">My Role:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">👨‍💻 Developed core gameplay mechanics, including sandwich assembly and customer service systems.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🎨 Implemented user interface elements and ensured a smooth user experience.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🔧 Optimized game performance across various devices to ensure stability and responsiveness.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">📈 Integrated analytics tools to monitor player engagement and inform future updates.</p>
                </li>
              </ul>
            </li>

          </ul>


          <section className="service">
            <ul className="service-list">

              <a className="service-item" href="https://apps.apple.com/us/app/sandwich-please/id6475763350?l">
                <div className="service-icon-box">
                  <img src="/assets/images/AppStore-Icons.svg" alt="Demo" width="40" />
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Play Game IOS</h4>
                </div>
              </a>

              <a className="service-item" href="https://play.google.com/store/apps/details?id=com.gb.sandwichidle.burgerplease.pizza.coffee&hl">
                <div className="service-icon-box">
                  <img src="/assets/images/GooglePlay-Icon.svg" alt="Demo" width="40" />
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Play Game Android</h4>
                </div>
              </a>
            </ul>
          </section>


    </section>
  ),
  "nekoverse": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="nekoverse">

          <ul className="project-list">

          </ul>
          <section className="video-demo">
            <h4 className="h4">🎥 Gameplay Trailer</h4>
            <div className="video-wrapper" style={{ marginTop: "12px" }}>
              <iframe
                width="100%"
                height="480"
                src="https://www.youtube.com/embed/4FiWVHmdfig"
                title="What is Nekoverse?"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen>
              </iframe>
            </div>
          </section>

          <div className="project-gallery">


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Nekoverse/2.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Nekoverse/2.jpg"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Nekoverse/3.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                  src="/assets/images/game/Nekoverse/3.webp"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Nekoverse/5.jpg", alt: " screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Nekoverse/5.jpg"
                    loading="lazy" alt=" screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Nekoverse/6.webp", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Nekoverse/6.webp"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Nekoverse/7.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Nekoverse/7.jpg"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>



          </div>



          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>
            <h3 className="h3">Nekoverse - GameFI</h3>
          </div>
          <ul className="timeline-list">
            <li className="timeline-item">
              <span>2022 — 2023</span>
              <p className="timeline-text description">
                <strong>Nekoverse</strong> is a Play-to-Earn MMORPG built on blockchain technology, offering players a decentralized in-game economy and a Guild system utilizing DAO governance. Players can engage in PvE and PvP battles, explore the world, farm resources, and craft items.
              </p>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Key Features:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">⚔️ <strong>Real-time Skill-based Battles:</strong> Engage in various modes like 1v1, 3v3, Tournaments, and Boss Raids, utilizing elements, skills, and equipment.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🌍 <strong>Exploration & Resource Farming:</strong> Discover hidden areas, harvest resources like ores and wood, and sell them in the marketplace.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🛠️ <strong>Comprehensive Crafting System:</strong> Craft items that drive game progression and impact battle prowess.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🏛️ <strong>Neko Temple:</strong> Stake in-game currencies to earn governance tokens and passive income, enhancing community engagement.</p>
                </li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">My Role:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">👨‍💻 Served as a <strong>Middle Unity Developer</strong>, collaborating with a team to implement core gameplay mechanics and optimize performance.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🔧 Developed real-time battle systems, including skill mechanics and elemental interactions.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🌐 Integrated blockchain features, such as NFT assets and staking mechanisms, into the Unity environment.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">📊 Conducted performance profiling and optimization to ensure smooth gameplay on various devices.</p>
                </li>
              </ul>
            </li>

          </ul>


          <section className="service">
            <ul className="service-list">
              <a className="service-item" href="https://gam3s.gg/nekoverse/">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-dev.svg" alt="Demo" width="40" />
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Main website</h4>
                </div>
              </a>

            </ul>
          </section>


    </section>
  ),
  "muloren": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="muloren">

          <ul className="project-list">

          </ul>
          <section className="video-demo">
            <h4 className="h4">🎥 Gameplay Trailer</h4>
            <div className="video-wrapper" style={{ marginTop: "12px" }}>
              <iframe
                width="100%"
                height="480"
                src="https://www.youtube.com/embed/UTqN9xl2pBM"
                title="MU Loren Gameplay"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen>
              </iframe>
            </div>
          </section>

          <div className="project-gallery">



            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MuLoren/banner-1.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/MuLoren/banner-1.jpg"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MuLoren/banner-2.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                  src="/assets/images/game/MuLoren/banner-2.jpg"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MuLoren/banner-3.jpg", alt: " screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/MuLoren/banner-3.jpg"
                    loading="lazy" alt=" screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MuLoren/1.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/MuLoren/1.jpg"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MuLoren/2.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/MuLoren/2.jpg"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>

            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/MuLoren/3.jpg", alt: "screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/MuLoren/3.jpg"
                    loading="lazy" alt="screenshot 1"/>
                </figure>
              </button>
            </div>



          </div>



          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>
            <h3 className="h3">MU: Loren Mobile</h3>
          </div>
          <ul className="timeline-list">
            <li className="timeline-item">
              <span>2024 — 2025</span>
              <p className="timeline-text description">
                <strong>MU: Loren Mobile</strong> is a mobile MMORPG inspired by the legendary MU Online. It brings the classic gameplay, iconic character classes, and intense PvE/PvP content to life with stunning 3D graphics optimized for mobile.
              </p>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">My Role:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">👨‍💻 Worked as a <strong>Senior Unity Developer</strong> in a collaborative team, contributing to core gameplay implementation and system optimization.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">⚙️ Developed and maintained key gameplay systems including quest system, class mechanics, and monster spawning logic.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">📈 Handled performance profiling and optimization for smooth gameplay on mobile devices.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🎨 Integrated UI/UX elements and implemented several in-game events and battle systems.</p>
                </li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Key Features:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">🧙 <strong>Diverse Character Classes:</strong> Choose from 5 iconic classes: Dark Wizard, Dark Knight, Fairy Elf, Magic Gladiator, and Dark Lord — each with unique abilities and styles.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">📜 <strong>Extensive Quest System:</strong> Includes daily, weekly, party, and guild missions to enhance exploration and engagement.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🛡️ <strong>Classic MU Features:</strong> Stat allocation, Loren Market free trade, Chaos System gear crafting, and signature events like Blood Castle, Devil Square, Chaos Castle, and Arena.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🎮 <strong>Immersive 3D Graphics:</strong> High-quality visuals recreate the legendary MU world in vivid detail for mobile devices.</p>
                </li>
              </ul>
            </li>


          </ul>


          <section className="service">
            <ul className="service-list">
              <a className="service-item" href="https://lucdia.adnxgames.vn/trang-chu">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-dev.svg" alt="Demo" width="40" />
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Main website</h4>
                </div>
              </a>

              <a className="service-item" href="https://lucdia.adnxgames.vn/ios">
                <div className="service-icon-box">
                  <img src="/assets/images/AppStore-Icons.svg" alt="Demo" width="40" />
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Play Game IOS</h4>
                </div>
              </a>

              <a className="service-item" href="https://play.google.com/store/apps/details?id=com.mobi.ldlorencia">
                <div className="service-icon-box">
                  <img src="/assets/images/GooglePlay-Icon.svg" alt="Demo" width="40" />
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Play Game Android</h4>
                </div>
              </a>
            </ul>
          </section>


          <section className="service">
            <ul className="service-list">

            </ul>
          </section>

    </section>
  ),
  "idleCyber": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="idleCyber">

          <ul className="project-list">
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Idle_cyber/thumbnai.png", alt: "Idle Cyber Banner" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="/assets/images/game/Idle_cyber/thumbnai.png"  style={{ width: "1040px", height: "500px" }} loading="lazy" alt="Idle Cyber Banner" />
                </figure>
              </button>
            </div>

          </ul>

          <div className="project-gallery">
            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Idle_cyber/1.png", alt: "Idle Cyber screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Idle_cyber/1.png"
                    loading="lazy" alt="Idle Cyber screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Idle_cyber/2.png", alt: "Idle Cyber screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Idle_cyber/2.png"
                    loading="lazy" alt="Idle Cyber screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Idle_cyber/5.png", alt: "Idle Cyber screenshot 5" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Idle_cyber/5.png"
                    loading="lazy" alt="Idle Cyber screenshot 5"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Idle_cyber/3.png", alt: "Idle Cyber screenshot 3" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Idle_cyber/3.png"
                    loading="lazy" alt="Idle Cyber screenshot 3"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Idle_cyber/4.png", alt: "Idle Cyber screenshot 4" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Idle_cyber/4.png"
                    loading="lazy" alt="Idle Cyber screenshot 4"/>
                </figure>
              </button>
            </div>


          </div>



          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>
            <h3 className="h3">Idle Cyber</h3>
          </div>
          <ul className="timeline-list">
            <li className="timeline-item">
              <span>2021 — 2022</span>
              <p className="timeline-text description">
                <strong>Idle Cyber</strong> is a cyberpunk idle tower defense game set in a post-apocalyptic 2077 world.
              </p>
              <p className="timeline-text description">
                Players defend the Earth from alien invaders by strategically deploying legendary heroes, upgrading powerful weapons, and customizing gear to survive endless enemy waves and boss battles.
              </p>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">My Roles:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">Working with other senior developer to create the full gameplay loop including stages, upgrades, rewards, and ad integration.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">Implemented idle mechanics with strategic tower defense combat.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">Built a basic NFT marketplace with wallet and testnet blockchain integration.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">Handled UI/UX, animation integration, and performance optimization for mobile devices.</p>
                </li>
              </ul>
            </li>
          </ul>


          <section className="service">
            <ul className="service-list">
              <a className="service-item" href="https://o0-mad-0o.itch.io/cyber-war">
                <div className="service-icon-box">
                  <img src="/assets/images/game/Idle_cyber/icon_idle_cyber.png" alt="Demo" width="40" />
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Play Game (WebGL)</h4>
                </div>
              </a>

              <a className="service-item" href="https://apps.apple.com/us/app/cyber-war-idle-defense-heroes/id1563690159?l=vi">
                <div className="service-icon-box">
                  <img src="/assets/images/AppStore-Icons.svg" alt="Demo" width="40" />
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Play Game IOS</h4>
                </div>
              </a>

              <a className="service-item" href="https://play.google.com/store/apps/details?id=com.hollow.idlecyberdefense">
                <div className="service-icon-box">
                  <img src="/assets/images/GooglePlay-Icon.svg" alt="Demo" width="40" />
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Play Game Android</h4>
                </div>
              </a>
            </ul>
          </section>


          <section className="service">
            <ul className="service-list">

            </ul>
          </section>

    </section>
  ),
  "sudoku": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="sudoku">

          <ul className="project-list">
          </ul>

          <div className="project-gallery">
            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sudoku/1.png", alt: "Sudoku screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Sudoku/1.png"
                    loading="lazy" alt="Sudoku screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sudoku/2.png", alt: "Sudoku screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Sudoku/2.png"
                    loading="lazy" alt="Sudoku screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sudoku/3.png", alt: "Sudoku screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Sudoku/3.png"
                    loading="lazy" alt="Sudoku screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sudoku/4.png", alt: "Sudoku screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Sudoku/4.png"
                    loading="lazy" alt="Sudoku screenshot 1"/>
                </figure>
              </button>
            </div>


            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sudoku/5.png", alt: "Sudoku screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Sudoku/5.png"
                    loading="lazy" alt="Sudoku screenshot 1"/>
                </figure>
              </button>
            </div>

            <div className="project-item active" >
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Sudoku/6.png", alt: "Sudoku screenshot 1" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="/assets/images/game/Sudoku/6.png"
                    loading="lazy" alt="Sudoku screenshot 1"/>
                </figure>
              </button>
            </div>



          </div>



          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>
            <h3 className="h3">Sudoku</h3>
          </div>
          <ul className="timeline-list">
            <li className="timeline-item">
              <span>2024 — 2025</span>
              <p className="timeline-text description">
                <strong>Sudoku - Classic Brain Puzzle</strong> is the perfect game for puzzle lovers! Whether you're a beginner or a Sudoku master, enjoy endless fun with thousands of levels and daily challenges.
              </p>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">My Role:</h1>
              <p className="timeline-text description">Solo developer – handled all aspects from game design to publishing.</p>
            </li>


            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Key Features:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">🧠 Train your brain: Each puzzle sharpens logic and concentration.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">📶 Play offline anytime, anywhere.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🌟 Thousands of classic Sudoku puzzles with 4 difficulty levels: Easy to Expert.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🗓️ Daily challenge mode with new puzzles each day.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">💡 Hints & Undo options for flexible gameplay.</p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">🌙 Minimalist and user-friendly interface with dark mode for night play.</p>
                </li>
              </ul>
            </li>
          </ul>


          <section className="service">
            <ul className="service-list">
              <a className="service-item" href="/Games/Sudoku/index.html">
                <div className="service-icon-box">
                  <img src="/assets/images/game/Sudoku/icon.png" alt="Demo" width="40" />
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Play Game (WebGL)</h4>
                </div>
              </a>

              <a className="service-item" href="https://play.google.com/store/apps/details?id=com.hollow.sudoku">
                <div className="service-icon-box">
                  <img src="/assets/images/GooglePlay-Icon.svg" alt="Demo" width="40" />
                </div>
                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Play Game Android</h4>
                </div>
              </a>
            </ul>
          </section>


          <section className="service">
            <ul className="service-list">

            </ul>
          </section>

    </section>
  ),
  "tilesmatch3": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="tilesmatch3">

            <ul className="project-list">
              <div className="project-item active">
                <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Tilesmatch3/thumbnail.png", alt: "tilesmatch3 Banner" })} aria-label="View enlarged image">
                  <figure className="project-img">
                    <img src="/assets/images/game/Tilesmatch3/thumbnail.png"  style={{ width: "1024px", height: "500px" }} loading="lazy" alt="tilesmatch3 Banner" />
                  </figure>
                </button>
              </div>

            </ul>

            <div className="project-gallery">
              <div className="project-item active" >
                <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Tilesmatch3/1.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                  <figure className="project-img">
                    <img
                      src="/assets/images/game/Tilesmatch3/1.png"
                      loading="lazy" alt="screenshot 1"/>
                  </figure>
                </button>
              </div>


              <div className="project-item active" >
                <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "/assets/images/game/Tilesmatch3/2.png", alt: "screenshot 1" })} aria-label="View enlarged image">
                  <figure className="project-img">
                    <img
                      src="/assets/images/game/Tilesmatch3/2.png"
                      loading="lazy" alt="screenshot 1"/>
                  </figure>
                </button>
              </div>


            </div>



            <div className="title-wrapper">
              <div className="icon-box">
                <Icon name="book-outline"  />
              </div>
              <h3 className="h3">Tiles Match 3: Mahjong</h3>
            </div>
            <ul className="timeline-list">
              <li className="timeline-item">
                <span>2023 — 2024</span>
                <p className="timeline-text description">
                  <strong>Tiles Match 3: Mahjong</strong> is a relaxing yet challenging tile-matching puzzle game. Inspired by the traditional Mahjong gameplay, it introduces a triple-tile matching mechanic that’s both fun and engaging.
                </p>
              </li>

              <li className="timeline-item">
                <h1 className="h4 timeline-item-title">My Role:</h1>
                <p className="timeline-text description">Solo developer – handled all aspects from game design to publishing.</p>
              </li>


              <li className="timeline-item">
                <h1 className="h4 timeline-item-title">Key Features:</h1>
                <ul className="timeline-description-list">
                  <li className="timeline-description">
                    <p className="timeline-text description">🧩 Match 3 tiles with the same pattern to clear the board.</p>
                  </li>
                  <li className="timeline-description">
                    <p className="timeline-text description">🎯 Hundreds of handcrafted levels with increasing difficulty.</p>
                  </li>
                  <li className="timeline-description">
                    <p className="timeline-text description">🌸 Beautiful themes and tile sets to unlock as you progress.</p>
                  </li>
                  <li className="timeline-description">
                    <p className="timeline-text description">🧘 Soothing music and calming visuals for stress-free gameplay.</p>
                  </li>
                  <li className="timeline-description">
                    <p className="timeline-text description">📱 Designed for all ages, playable offline without internet.</p>
                  </li>
                  <li className="timeline-description">
                    <p className="timeline-text description">🏆 Earn rewards and climb the leaderboard by completing levels quickly.</p>
                  </li>
                </ul>
              </li>
            </ul>


            <section className="service">
              <ul className="service-list">
                <a className="service-item" href="/Games/Tilesmatch3/index.html">
                  <div className="service-icon-box">
                    <img src="/assets/images/game/Tilesmatch3/icon.png" alt="Demo" width="40" />
                  </div>
                  <div className="service-content-box">
                    <h4 className="h4 service-item-title">Play Game (WebGL)</h4>
                  </div>
                </a>

                <a className="service-item" href="https://play.google.com/store/apps/details?id=com.hollow.tilesmatch.mahjong">
                  <div className="service-icon-box">
                    <img src="/assets/images/GooglePlay-Icon.svg" alt="Demo" width="40" />
                  </div>
                  <div className="service-content-box">
                    <h4 className="h4 service-item-title">Play Game Android</h4>
                  </div>
                </a>
              </ul>
            </section>



    </section>
  ),
  "heroicDefense": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="heroicDefense">


          <ul className="project-list">


            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/80ad6adb-8497-4416-8a0e-cdd0bda4c0e2", alt: "Game Banner" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/80ad6adb-8497-4416-8a0e-cdd0bda4c0e2"
                    loading="lazy" alt="Game Banner" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/79237991-15d5-4d12-a230-2ef02e009513", alt: "Battle Scene" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/79237991-15d5-4d12-a230-2ef02e009513"
                    loading="lazy" alt="Battle Scene" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/7b2b48f7-54eb-4711-9d0e-1a177bc84286", alt: "BattleScene" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/7b2b48f7-54eb-4711-9d0e-1a177bc84286"
                    loading="lazy" alt="BattleScene" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/07967261-9e41-426b-97a9-68d19752861a", alt: "Loading Scene" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/07967261-9e41-426b-97a9-68d19752861a"
                    loading="lazy" alt="Loading Scene" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/790edaa2-a8e6-4ab6-a6ec-b15acbe70caf", alt: "Battle Scene" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/790edaa2-a8e6-4ab6-a6ec-b15acbe70caf"
                    loading="lazy" alt="Battle Scene" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/1ff2f712-b1d8-4f1b-9712-345a1a571b53", alt: "Main Scene" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/1ff2f712-b1d8-4f1b-9712-345a1a571b53"
                    loading="lazy" alt="Main Scene" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/2f369a89-192e-4bc9-9356-12b65273672c", alt: "IAP" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/2f369a89-192e-4bc9-9356-12b65273672c"
                    loading="lazy" alt="IAP" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/60dc8f0e-9f30-4453-9b61-7491cebbfd10", alt: "Gacha Rate" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/60dc8f0e-9f30-4453-9b61-7491cebbfd10"
                    loading="lazy" alt="Gacha Rate" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/e684b198-ecb5-4dc4-b6ad-522cbb8880cf", alt: "Settings Panel" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/e684b198-ecb5-4dc4-b6ad-522cbb8880cf"
                    loading="lazy" alt="Settings Panel" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/1c79da14-c16a-455c-8143-b31fd2b32f24", alt: "Tutorial Step" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/1c79da14-c16a-455c-8143-b31fd2b32f24"
                    loading="lazy" alt="Tutorial Step" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/910ae1db-a140-44c6-bc9e-56ddcf380681", alt: "Battle Lose" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/910ae1db-a140-44c6-bc9e-56ddcf380681"
                    loading="lazy" alt="Battle Lose" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/27c6435d-3ec5-48a5-a49d-ac4ec84f645f", alt: "Summon Materials Chest" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/27c6435d-3ec5-48a5-a49d-ac4ec84f645f"
                    loading="lazy" alt="Summon Materials Chest" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/15cab860-1208-47bf-928c-5ba763383877", alt: "Upgrade Character's Weapon" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/15cab860-1208-47bf-928c-5ba763383877"
                    loading="lazy" alt="Upgrade Character's Weapon" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/be7e519b-1a2f-4fb6-80e7-743945762611", alt: "Summon Weapons Chest" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/be7e519b-1a2f-4fb6-80e7-743945762611"
                    loading="lazy" alt="Summon Weapons Chest" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/fe3d3b92-07c3-405d-9a7e-8b0e375e262c", alt: "Shop" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/fe3d3b92-07c3-405d-9a7e-8b0e375e262c"
                    loading="lazy" alt="Shop" />
                </figure>
              </button>
            </div>



          </ul>

          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>
            <h3 className="h3">Heroic Defense</h3>
          </div>

          <ul className="timeline-list">
            <li className="timeline-item">
              <span>Sep/2024 — Jan/2025</span>
              <ul>
                <li>
                  <ul className="timeline-description-list">
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        Team composition includes 4 members: 2 game developers, 1 game designer, and 1 artist.
                      </p>
                    </li>
                    <li className="timeline-description"></li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Main responsibilities:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Implemented unique enemy behaviors and new enemy types across multiple maps.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Designed and optimized special weapon mechanics, including saw, rocket, machine gun, and
                    flamethrower.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Developed robust reward systems with material drops and currency management.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Created and fine-tuned passive and active skill systems for dynamic gameplay.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Enhanced combat with refined damage calculation and energy regeneration mechanics.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Integrated SDK, ads, and in-app purchases (IAP).
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Took full responsibility for the core game development.
                  </p>
                </li>
                <li className="timeline-description"></li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Achievements:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Task Management:</strong>
                    <br />
                    Successfully divided tasks clearly among the team members, ensuring efficiency and accountability.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Agile Process:</strong>
                    <br />
                    Followed Agile/Scrum methodologies to ensure smooth project development and delivery.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Gameplay Enhancements:</strong>
                    <br />
                    Delivered innovative enemy behaviors and combat systems, providing a more engaging experience.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Performance Optimization:</strong>
                    <br />
                    Optimized game mechanics, ensuring high performance and stability during gameplay.
                  </p>
                </li>

                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Global Success:</strong><br />
                    <strong>
                      Achieved 10K - 50K downloads
                    </strong>: A significant milestone as of January 2025.
                  </p>
                </li>

                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Global Success:</strong><br />
                    <strong>
                      Achieved over 200K downloads
                    </strong>: A significant milestone after one month of release.
                    <span className="inline-link">
                      <a className="icon-tag-chplay" href="https://app.sensortower.com/overview/com.hd.heroic.defense"
                        target="_blank" rel="noopener noreferrer" style={{ color: "var(--green-teal)" }}>
                        Check newest achievement on Android
                      </a>
                    </span>

                    <span className="inline-link">
                      <a className="icon-tag-applestore" href="https://app.sensortower.com/overview/6742034673"
                        target="_blank" rel="noopener noreferrer" style={{ color: "var(--green-teal)" }}>
                        Check newest achievement on iOS
                      </a>
                    </span>

                  </p>
                </li>

              </ul>
            </li>
            <li className="timeline-item"></li>
          </ul>

          <section className="service">
            <h3 className="h3 service-title"></h3>

            <ul className="service-list">
              <a className="service-item" href="https://play.google.com/store/apps/details?id=com.hd.heroic.defense">
                <div className="service-icon-box">
                  <img src="/assets/images/GooglePlay-Icon.svg" alt="Playing Heroic Defense" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Playing Game</h4>
                </div>

              </a>
              <a className="service-item" href="https://apps.apple.com/app/heroic-defense/id6742034673">
                <div className="service-icon-box">
                  <img src="/assets/images/AppStore-Icons.svg" alt="Playing Heroic Defense" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Playing Game</h4>
                </div>
              </a>
            </ul>
          </section>


    </section>
  ),
  "iceBreakingBattle": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="iceBreakingBattle">


          <ul className="project-list">

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/f9591bca-b07b-4cb4-8d18-542a88b860ad", alt: "Fun Gameplay" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/f9591bca-b07b-4cb4-8d18-542a88b860ad"
                    loading="lazy" alt="Fun Gameplay" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/06e03ac3-5971-45df-89e1-320ce2bd4e19", alt: "Accurate Physical Environment Simulation" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/06e03ac3-5971-45df-89e1-320ce2bd4e19"
                    loading="lazy" alt="Accurate Physical Environment Simulation" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/a2932be6-554f-44a4-a589-8dd1012ded7a", alt: "Environmental Change System" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/a2932be6-554f-44a4-a589-8dd1012ded7a"
                    loading="lazy" alt="Environmental Change System" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/a63817de-05b6-4136-87e2-1279d451ad90", alt: "Environmental Change System Alternate" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/a63817de-05b6-4136-87e2-1279d451ad90"
                    loading="lazy" alt="Environmental Change System Alternate" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/a48908a5-9d6a-4a02-a78d-06935485e47f", alt: "Diverse Skin System" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/a48908a5-9d6a-4a02-a78d-06935485e47f"
                    loading="lazy" alt="Diverse Skin System" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/user-attachments/assets/3be46ce5-f57e-4443-a398-62da81754aa0", alt: "Weapon Classification" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img src="https://github.com/user-attachments/assets/3be46ce5-f57e-4443-a398-62da81754aa0"
                    loading="lazy" alt="Weapon Classification" />
                </figure>
              </button>
            </div>


          </ul>

          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="game-controller-outline"  />
            </div>

            <h3 className="h3">Ice Breaking Battle (Solo Dev)</h3>
          </div>

          <ul className="timeline-list">
            <li className="timeline-item">
              <span>Jul/2024 — Sep/2024</span>
              <ul>
                <li>
                  <ul className="timeline-description-list">
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        Team composition includes a total of 2 members: 1 game developer and 1 game designer.
                      </p>
                    </li>
                    <li className="timeline-description"></li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Main responsibility:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Developed complex enemy behaviors, including intelligent movement and attack strategies.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Implemented power-up systems like bombs, special discs, and enhanced player abilities.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Designed and balanced multiple levels with distinct challenges and environments.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Built dynamic reward systems, including currency synchronization and gem-to-coin conversion.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Enhanced gameplay mechanics with physics-based collision handling and power disc effects.
                  </p>
                </li>
                <li className="timeline-description"></li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Achievements:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Enhanced Gameplay Experience:</strong><br />
                    <strong>Introduced complex enemy behaviors:</strong> Making the game more challenging and
                    engaging.<br />
                    <strong>Implemented various power-ups:</strong> Including bombs, special discs, and enhanced player
                    abilities to improve strategy and dynamics.<br />
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Level Design Excellence:</strong><br />
                    <strong>Designed and balanced multiple levels:</strong> Offering diverse challenges and maintaining
                    player interest through unique environments.<br />
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Reward System Optimization:</strong><br />
                    <strong>Built dynamic reward systems:</strong> Including currency synchronization and gem-to-coin
                    conversion, encouraging replayability.<br />
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Improved Game Physics:</strong><br />
                    <strong>Refined collision handling:</strong> Making gameplay smoother and more realistic with
                    physics-based mechanics.<br />
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Global Success:</strong><br />
                    <strong>
                      Achieved 50K+ downloads
                    </strong>: A significant milestone as of January 2025.
                    <span className="inline-link">
                      <a href="https://app.sensortower.com/overview/com.ibb.ice.breaking.battle" target="_blank"
                      rel="noopener noreferrer" style={{ color: "var(--green-teal)" }}>Check newest achievement</a>
                    </span>
                  </p>
                </li>

              </ul>
            </li>

            <li className="timeline-item"></li>
          </ul>

          <section className="service">
            <h3 className="h3 service-title"></h3>

            <ul className="service-list">
              <a className="service-item" href="https://play.google.com/store/apps/details?id=com.ibb.ice.breaking.battle">
                <div className="service-icon-box">
                  <img src="/assets/images/GooglePlay-Icon.svg" alt="Playing Ice Breaking" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Playing Game</h4>
                </div>
              </a>
            </ul>

          </section>


    </section>
  ),
  "metameAmusementPark": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="metameAmusementPark">


          <ul className="project-list">

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/d78990f0-2b48-4635-bf33-7ed637940f63", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/d78990f0-2b48-4635-bf33-7ed637940f63"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>





          </ul>

          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>

            <h3 className="h3">Metame Amusement Park</h3>
          </div>

          <ul className="timeline-list">
            <li className="timeline-item">
              <span>Feb/2023 — Apr/2024</span>
              <ul>
                <li>
                  <ul className="timeline-description-list">
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        Team composition includes a total of 4 individuals, with 3 working in the front-end team and 1
                        serving as a tester.
                      </p>
                    </li>
                    <li className="timeline-description"></li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Main responsibility:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Added an accept button.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Implemented various hints and icons for better user guidance.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Added and configured various audio elements like fireworks sound, code hacked sound, and main scene
                    audio setup.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Integrated the Dynomega quest system.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Added functionalities related to sitting animations, including different animations and sitting
                    spots.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Implemented a spinning cup gimmick with slow-in slow-out speed and on/off features.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Handled passcode interaction, popup pin code, and sync camera between server and client.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Fixed field of view (FOV) issues on SceneCapture camera.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Corrected various interaction and display bugs, such as incorrect icon hints and lighting
                    inconsistencies.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Improved animation sequences and attachment logic for characters.
                  </p>
                </li>
                <li className="timeline-description"></li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Achievements:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Enhanced User Experience:</strong>
                    <br />
                    <strong>Added accept buttons and various hints:</strong> Making the user interface more
                    intuitive and user-friendly.
                    <br />
                    <strong>Implemented dynamic quest systems and interactive elements:</strong> Enhancing
                    gameplay
                    depth and engagement.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Improved Audio and Visuals:</strong>
                    <br />
                    <strong>Integrated various audio effects and sound setups:</strong> Significantly enriching
                    the
                    auditory experience.
                    <br /><strong>Addressed visual consistency issues:</strong> Particularly with lighting and
                    reflection, ensuring a more immersive environment.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Increased Interactivity:</strong>
                    <br />
                    <strong>Added interactive elements like passcode hints and popup pin codes:</strong> Improving
                    user interaction and puzzle-solving aspects.
                    <br /><strong>Enhanced interaction mechanics with the environment:</strong> Such as the spinning cup
                    feature and interaction with input.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    <strong>Optimized Performance and Stability:</strong>
                    <br />
                    <strong>Resolved conflicts and bugs:</strong> Leading to a more stable and smoother gameplay
                    experience.
                    <br /> <strong>Improved character animations and camera handling:</strong> Reducing glitches and
                    improving overall game fluidity.
                  </p>
                </li>
              </ul>
            </li>
            <li className="timeline-item"></li>
          </ul>

          <section className="service">
            <h3 className="h3 service-title"></h3>

            <ul className="service-list">
              <a className="service-item" href="https://www.metame.ne.jp/start">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-dev.svg" alt="Main Website" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Main Website</h4>
                </div>
              </a>
            </ul>

          </section>


    </section>
  ),
  "cryptoquest": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="cryptoquest">


          <ul className="project-list">

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/ec260ea9-c07f-4775-b890-0450594b1adc", alt: "Revive" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/ec260ea9-c07f-4775-b890-0450594b1adc"
                    loading="lazy" alt="Revive" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/006c5b82-75d6-4e9d-bdfc-056bfb7131b7", alt: "Quest" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/006c5b82-75d6-4e9d-bdfc-056bfb7131b7"
                    loading="lazy" alt="Quest" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/404ee6aa-eb73-4637-8501-918b974a03af", alt: "NPCBehaviour" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/404ee6aa-eb73-4637-8501-918b974a03af"
                    loading="lazy" alt="NPCBehaviour" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/73ff3c78-9475-48d1-9f99-7cc686e618f7", alt: "Home" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/73ff3c78-9475-48d1-9f99-7cc686e618f7"
                    loading="lazy" alt="Home" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/957fb9ae-cb17-44a0-8ff5-dbca4a03cfa9", alt: "EvolveEquipment" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/957fb9ae-cb17-44a0-8ff5-dbca4a03cfa9"
                    loading="lazy" alt="EvolveEquipment" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/60bd840f-9942-49ec-929c-9497b0d7717a", alt: "Cheat" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/60bd840f-9942-49ec-929c-9497b0d7717a"
                    loading="lazy" alt="Cheat" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/0104ba58-293f-4b1e-80ba-1dfc76c8fb28", alt: "ChangeClass" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/0104ba58-293f-4b1e-80ba-1dfc76c8fb28"
                    loading="lazy" alt="ChangeClass" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/e3952602-ac8b-4462-986d-342c09bd37d6", alt: "BeastToolTip" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/e3952602-ac8b-4462-986d-342c09bd37d6"
                    loading="lazy" alt="BeastToolTip" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/a8549106-234d-47ae-b6a0-5af68edae2e1", alt: "BeastEvolve" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/a8549106-234d-47ae-b6a0-5af68edae2e1"
                    loading="lazy" alt="BeastEvolve" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/2dfa44a6-800a-4ea8-9574-03cd4d35bd34", alt: "Beast" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/2dfa44a6-800a-4ea8-9574-03cd4d35bd34"
                    loading="lazy" alt="Beast" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/aae1b3d5-0aaa-492c-87e3-1016088ed903", alt: "Beast Detail" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/aae1b3d5-0aaa-492c-87e3-1016088ed903"
                    loading="lazy" alt="Beast Detail" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/643fa9c6-025b-4120-b703-7580ce6617bf", alt: "Battle" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/643fa9c6-025b-4120-b703-7580ce6617bf"
                    loading="lazy" alt="Battle" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/ba6adc74-b14c-4884-99b2-69968bacdf2b", alt: "Tavern" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/ba6adc74-b14c-4884-99b2-69968bacdf2b"
                    loading="lazy" alt="Tavern" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/978fa48b-24fd-49fc-aafd-1c011aef405e", alt: "Status" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/978fa48b-24fd-49fc-aafd-1c011aef405e"
                    loading="lazy" alt="Status" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/76742036-0227-4de8-a417-d4d1c9445b8d", alt: "Reward" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/76742036-0227-4de8-a417-d4d1c9445b8d"
                    loading="lazy" alt="Reward" />
                </figure>
              </button>
            </div>



            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'video', src: "/assets/videos/CryptoQuest.mp4" })} aria-label="View full video">
                <figure className="project-video">
                  <video muted="true" preload="none"
                    poster="https://github.com/Long18/long18.github.io/assets/28853225/2aa03da8-cdf0-4c39-857a-a53e6478a2ac">
                    <source src="/assets/videos/CryptoQuest.mp4" type="video/mp4" /></video>
                  <button className="play-button"></button>
                </figure>
              </button>
            </div>
          </ul>

          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>

            <h3 className="h3">Crypto Quest</h3>
          </div>

          <ul className="timeline-list">
            <li className="timeline-item">
              <span>May/2023 — Feb/2024</span>
              <ul>
                <li>
                  <ul className="timeline-description-list">
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        This game, inspired by Dragon Quest, operates in turns and incorporates various intricate
                        elements
                        such as quests, abilities, characters, and networking features.
                      </p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        Team composition includes a total of 14 individuals, with 9 working in the front-end team, 3 in
                        the back-end team, and 2 serving as a tester. In an Agile Scrum setting, I've engaged with all
                        team members to exchange ideas, offer suggestions, and enhance our product collaboratively.
                      </p>
                    </li>
                    <li className="timeline-description"></li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Main responsibility:</h1>
              <h1 className="h4 timeline-item-responsibility">Quest System:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Contributed to the implementation of the Quest System, allowing for dynamic quest creation and
                    completion.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Worked closely with the back-end team to integrate quest logic and actor conditions into the game.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Conducted thorough testing and optimization to ensure smooth quest progression and player
                    engagement.
                  </p>
                </li>
                <li className="timeline-description"></li>
              </ul>
              <h1 className="h4 timeline-item-responsibility">Audio System:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Integrated the Audio Manager system to enhance the in-game audio experience, including music, sound
                    effects, and ambient sounds.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Implemented dynamic audio controls based on game events and player actions to create a more
                    immersive gameplay environment.
                  </p>
                </li>
                <li className="timeline-description"></li>
              </ul>
              <h1 className="h4 timeline-item-responsibility">Beast System:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Collaborated on the development of the Beast Management module, enabling players to manage and
                    upgrade their in-game creatures.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Designed and implemented APIs for seamless interaction with beast data.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Contributed to UI elements for beast management, including stat displays and upgrade interfaces.
                  </p>
                </li>
                <li className="timeline-description"></li>
              </ul>
              <h1 className="h4 timeline-item-responsibility">Game Mechanics Development:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Implemented crucial game mechanics, including item usage, equipment management, and skill
                    integration.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Developed systems for handling consumables, equipment rarity, and item effects, contributing to a
                    rich and immersive gameplay experience.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Optimized code and assets to improve overall game performance and player satisfaction.</p>
                </li>
                <li className="timeline-description"></li>
              </ul>
              <h1 className="h4 timeline-item-responsibility">UI/UX Enhancement:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Played an active role in enhancing the UI/UX of the game, focusing on currency display, language
                    settings, and menu navigation.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Collaborated with team to implement various UI elements, such as dialogue boxes, inventory editors,
                    and command menus.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Ensured localization support for multiple languages to enhance accessibility for a global player
                    base.
                </p></li>
                <li className="timeline-description"></li>
              </ul>
              <h1 className="h4 timeline-item-responsibility">Additional Functionality Development:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Implemented additional functionality, such as Cheat Management, Cutscene Management, and Tool Editor
                    (Delete account, build local with port 80, ScriptableObject Browser,etc).
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Provided support for live operations, including content updates, bug fixes, and performance
                    optimizations.
                  </p>
                </li>
                <li className="timeline-description"></li>
              </ul>
              <h1 className="h4 timeline-item-responsibility">Agile Scrum Collaboration:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Actively participated in Agile Scrum ceremonies, including sprint planning, daily stand-ups, and
                    retrospective meetings.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Engaged with cross-functional teams to exchange ideas, offer suggestions, and address challenges
                    collaboratively.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Provided support to team members as needed and collaborated effectively under the guidance of team
                    leads.
                </p></li>
                <li className="timeline-description"></li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Achievements:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Successfully delivered the CryptoQuest project to the client, meeting all requirements and
                    milestones
                    within the specified timeline.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Recognized for outstanding teamwork and contributions during project development, fostering a
                    collaborative and productive work environment.
                  </p>
                </li>
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Played a vital role in ensuring the quality and functionality of the game, contributing to the
                    overall success of the project.
                  </p>
                </li>
              </ul>
            </li>
            <li className="timeline-description"></li>
          </ul>

          <section className="service">
            <h3 className="h3 service-title"></h3>

            <ul className="service-list">
              <a className="service-item" href="https://crypto-quest.org/">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-dev.svg" alt="Main Website" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Main Website</h4>
                </div>
              </a>
              <a className="service-item" href="https://games.indigames.link/crypto-quest/stg/">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-app.svg" alt="Demo" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Playing game</h4>
                </div>
              </a>
            </ul>

          </section>


    </section>
  ),
  "fireFireFire": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="fireFireFire">


          <ul className="project-list">

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/ff590430-49d2-49f4-adad-a3c29e6360dd", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/ff590430-49d2-49f4-adad-a3c29e6360dd"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/ae1804a1-41cd-43d1-8f29-5432858b908e", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/ae1804a1-41cd-43d1-8f29-5432858b908e"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/73102955-16e2-432e-b71f-cfce255ccebf", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/73102955-16e2-432e-b71f-cfce255ccebf"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/92d53779-0455-4b55-b735-bbbbe3057526", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/92d53779-0455-4b55-b735-bbbbe3057526"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/04b48c62-3718-441a-9924-bf2afb85eaa8", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/04b48c62-3718-441a-9924-bf2afb85eaa8"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/c689d241-0ea0-4e1c-b2e9-3ae34a0b7b5e", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/c689d241-0ea0-4e1c-b2e9-3ae34a0b7b5e"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/79d2869e-1835-4973-9be1-f961ef5ed02c", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/79d2869e-1835-4973-9be1-f961ef5ed02c"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>




            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'video', src: "https://github.com/Long18/long18.github.io/assets/28853225/2d8ea356-74db-4ce6-8c06-e205b4439fe4" })} aria-label="View full video">
                <figure className="project-video">
                  <video muted="true" preload="none"
                    poster="https://github.com/Long18/long18.github.io/assets/28853225/e6249069-79ce-49a2-973f-a732426deb21">
                    <source
                      src="https://github.com/Long18/long18.github.io/assets/28853225/2d8ea356-74db-4ce6-8c06-e205b4439fe4"
                      type="video/mp4" /></video>
                  <button className="play-button"></button>
                </figure>
              </button>
            </div>
          </ul>

          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>

            <h3 className="h3">Fire fire fire</h3>
          </div>

          <ul className="timeline-list">
            <li className="timeline-item">
              <span>Jan/2023 — June/2024</span>
              <ul>
                <li>
                  <ul className="timeline-description-list">
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        Kantan Game is a website offering a variety of casual games and daily quizzes. It features
                        easy-to-play
                        games designed for quick entertainment. The site is managed by GMO Media, Inc., providing a
                        user-friendly platform for gaming enthusiasts to enjoy short, engaging activities.
                      </p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        Team composition includes a total of -- individuals, with -- working in the front-end team, --
                        in
                        the back-end team, and -- serving as a tester.
                      </p>
                    </li>
                    <li className="timeline-description"></li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Main responsibility:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Reduced the complexity of 3D object meshes to optimize performance and decrease loading times.
                  </p>
                  <p className="timeline-text description">
                    Integrated an ad system to enhance monetization.
                  </p>
                </li>
                <li className="timeline-description"></li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Achievements:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Successfully reduced the complexity of 3D object meshes, resulting in a 40% improvement in game
                    performance and a 25% decrease in loading times.
                  </p>
                </li>
              </ul>
            </li>
            <li className="timeline-item"></li>
          </ul>

          <section className="service">
            <h3 className="h3 service-title"></h3>

            <ul className="service-list">
              <a className="service-item" href="https://kantan.game/easygame">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-dev.svg" alt="Main Website" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Main Website</h4>
                </div>
              </a>
              <a className="service-item" href="https://kantan.game/easygame/game/489">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-app.svg" alt="Demo" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Playing game</h4>
                </div>
              </a>
            </ul>

          </section>


    </section>
  ),
  "rpgRun": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="rpgRun">


          <ul className="project-list">

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/6abb6842-6d73-4d75-b3d0-a58cde41d3a7", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/6abb6842-6d73-4d75-b3d0-a58cde41d3a7"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/cf357b36-160e-4e4e-99e3-598961cd6542", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/cf357b36-160e-4e4e-99e3-598961cd6542"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/0e0399e4-3e50-45bc-ad15-d8cc5c18fd9b", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/0e0399e4-3e50-45bc-ad15-d8cc5c18fd9b"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/ac2d911d-821f-4cf1-9674-a64a3bcfc883", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/ac2d911d-821f-4cf1-9674-a64a3bcfc883"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/0c86ed0d-f403-4dac-b8d0-593a9ed33aae", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/0c86ed0d-f403-4dac-b8d0-593a9ed33aae"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/29b8f2db-ddc2-47e9-8fd4-d7c0065521e8", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/29b8f2db-ddc2-47e9-8fd4-d7c0065521e8"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/646914a1-45af-4fce-a390-23aadf06115e", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/646914a1-45af-4fce-a390-23aadf06115e"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/baef087c-c6d5-40ea-8e11-06c0e5539101", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/baef087c-c6d5-40ea-8e11-06c0e5539101"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>




            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'video', src: "https://github.com/Long18/long18.github.io/assets/28853225/da68f79f-e05b-47e1-8dd2-8ebea3ad140f" })} aria-label="View full video">
                <figure className="project-video">
                  <video muted="true" preload="none"
                    poster="https://github.com/Long18/long18.github.io/assets/28853225/5b55f3c9-d157-4781-97ce-e6746686aada">
                    <source
                      src="https://github.com/Long18/long18.github.io/assets/28853225/da68f79f-e05b-47e1-8dd2-8ebea3ad140f"
                      type="video/mp4" /></video>
                  <button className="play-button"></button>
                </figure>
              </button>
            </div>
          </ul>

          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>

            <h3 className="h3">The Brave</h3>
          </div>

          <ul className="timeline-list">
            <li className="timeline-item">
              <span>Jan/2023 — Jun/2023</span>
              <ul>
                <li>
                  <ul className="timeline-description-list">
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        Kantan Game is a website offering a variety of casual games and daily quizzes. It features
                        easy-to-play
                        games designed for quick entertainment. The site is managed by GMO Media, Inc., providing a
                        user-friendly platform for gaming enthusiasts to enjoy short, engaging activities. </p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        Team composition includes a total of -- individuals, with -- working in the front-end team, --
                        in
                        the back-end team, and -- serving as a tester.
                      </p>
                    </li>
                    <li className="timeline-description"></li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Main responsibility:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Developed a new item reward system for ads, enhancing player incentives and engagement.
                  </p>
                  <p className="timeline-text description">
                    Integrated an ad system, increasing game monetization and boosting revenue.
                  </p>
                </li>
                <li className="timeline-description"></li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Achievements:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Developed a item rewards to improve gaming functionality, resulting in a more seamless user
                    experience and more player retention.</p>
                </li>
              </ul>
            </li>
            <li className="timeline-item"></li>
          </ul>

          <section className="service">
            <h3 className="h3 service-title"></h3>

            <ul className="service-list">
              <a className="service-item" href="https://kantan.game/easygame">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-dev.svg" alt="Main Website" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Main Website</h4>
                </div>
              </a>
              <a className="service-item" href="https://kantan.game/easygame/game/504">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-app.svg" alt="Demo" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Playing game</h4>
                </div>
              </a>
            </ul>

          </section>


    </section>
  ),
  "betakuma": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="betakuma">


          <ul className="project-list">

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/0fa2a3f9-fc25-433f-b775-390ae1be0023", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/0fa2a3f9-fc25-433f-b775-390ae1be0023"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/366c1b1b-8255-42bc-ba8f-9774656b0aa2", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/366c1b1b-8255-42bc-ba8f-9774656b0aa2"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/a8fa6e93-0332-4b1d-b135-ad78048c43f5", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/a8fa6e93-0332-4b1d-b135-ad78048c43f5"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/0d535774-f5fe-4625-a8ac-35d84692c271", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/0d535774-f5fe-4625-a8ac-35d84692c271"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/9a052f82-cced-406a-8646-1f92f1a9fee7", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/9a052f82-cced-406a-8646-1f92f1a9fee7"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>




            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'video', src: "https://github.com/Long18/long18.github.io/assets/28853225/78a30844-ad5b-48c9-be98-95a8840e6d02" })} aria-label="View full video">
                <figure className="project-video">
                  <video muted="true" preload="none"
                    poster="https://github.com/Long18/long18.github.io/assets/28853225/5040792c-53d6-47ed-b25a-40534433fae9">
                    <source
                      src="https://github.com/Long18/long18.github.io/assets/28853225/78a30844-ad5b-48c9-be98-95a8840e6d02"
                      type="video/mp4" /></video>
                  <button className="play-button"></button>
                </figure>
              </button>
            </div>
          </ul>

          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>

            <h3 className="h3">Betakkuma - Super Avoidance</h3>
          </div>

          <ul className="timeline-list">
            <li className="timeline-item">
              <span>Jan/2023 — Jun/2023</span>
              <ul>
                <li>
                  <ul className="timeline-description-list">
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        Kantan Game is a website offering a variety of casual games and daily quizzes. It features
                        easy-to-play
                        games designed for quick entertainment. The site is managed by GMO Media, Inc., providing a
                        user-friendly platform for gaming enthusiasts to enjoy short, engaging activities. </p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        Team composition includes a total of 2 individuals, with 1 working in the front-end and 1
                        serving as a tester.
                      </p>
                    </li>
                    <li className="timeline-description"></li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Main responsibility:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Developed a new inventory system to enhance gameplay functionality.
                  </p>
                  <p className="timeline-text description">
                    Refactored the currency system to improve efficiency and user experience.
                  </p>
                  <p className="timeline-text description">
                    Overhauled the point system for better tracking and reward distribution.
                  </p>
                  <p className="timeline-text description">
                    Integrated an ad system to monetize the game and increase revenue streams.
                  </p>
                </li>
                <li className="timeline-description"></li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Achievements:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Developed a new inventory system to enhance gameplay functionality, resulting in a smoother user
                    experience and increased player retention.
                  </p>
                </li>
              </ul>
            </li>
            <li className="timeline-item"></li>
          </ul>

          <section className="service">
            <h3 className="h3 service-title"></h3>

            <ul className="service-list">
              <a className="service-item" href="https://kantan.game/easygame">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-dev.svg" alt="Main Website" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Main Website</h4>
                </div>
              </a>
              <a className="service-item" href="https://kantan.game/easygame/game/483">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-app.svg" alt="Demo" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Playing game</h4>
                </div>
              </a>
            </ul>

          </section>


    </section>
  ),
  "mugenHorror": ({ onOpenMedia }) => (
    <section className="timeline project-item active" project-detail="true" data-detail-category="mugenHorror">


          <ul className="project-list">

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/0c6c898e-f0c2-42eb-9ef7-17559136384b", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/0c6c898e-f0c2-42eb-9ef7-17559136384b"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>

            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/46187032-e146-4a21-87ef-2e16559e6c30", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/46187032-e146-4a21-87ef-2e16559e6c30"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/8bc8af22-4829-462c-9817-9f7c88f49c02", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/8bc8af22-4829-462c-9817-9f7c88f49c02"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/c6e5cdfe-855e-4faf-9004-2e6541814ba6", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/c6e5cdfe-855e-4faf-9004-2e6541814ba6"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/3eb588b8-36fa-4800-bfe2-69d3f1611fc7", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/3eb588b8-36fa-4800-bfe2-69d3f1611fc7"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/b0eedffc-121d-405b-b6f5-827cc7fa282b", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/b0eedffc-121d-405b-b6f5-827cc7fa282b"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/57b374a8-e666-4f86-b925-4b64d7abce4c", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/57b374a8-e666-4f86-b925-4b64d7abce4c"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/88b77400-e8d7-4d27-baef-023b4c6f3d77", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/88b77400-e8d7-4d27-baef-023b4c6f3d77"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/91359264-f4d7-43ff-a687-a85e4d859786", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/91359264-f4d7-43ff-a687-a85e4d859786"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/853600e7-e13e-4556-8ff4-57c2bf7b7fa7", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/853600e7-e13e-4556-8ff4-57c2bf7b7fa7"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/0a6cd069-d8d0-4174-9ffc-34376c94c935", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/0a6cd069-d8d0-4174-9ffc-34376c94c935"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/dd108cde-14ab-40ff-9205-e567374d8aa3", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/dd108cde-14ab-40ff-9205-e567374d8aa3"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/084a2757-af2a-4368-b8f2-fd1f24095313", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/084a2757-af2a-4368-b8f2-fd1f24095313"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/719d3f12-f609-4c06-8cef-40a9a35853d5", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/719d3f12-f609-4c06-8cef-40a9a35853d5"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/9421ea97-d17b-4583-ad04-00e9543b5bcd", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/9421ea97-d17b-4583-ad04-00e9543b5bcd"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/13ac24dd-6ea2-4b82-a4e2-6199bc2aae20", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/13ac24dd-6ea2-4b82-a4e2-6199bc2aae20"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <button type="button" className="gallery-media-btn"  onClick={() => onOpenMedia({ type: 'image', src: "https://github.com/Long18/long18.github.io/assets/28853225/064e274d-38c5-42ee-823c-a7f78ba1da3d", alt: "Image" })} aria-label="View enlarged image">
                <figure className="project-img">
                  <img
                    src="https://github.com/Long18/long18.github.io/assets/28853225/064e274d-38c5-42ee-823c-a7f78ba1da3d"
                    loading="lazy" alt="Image" />
                </figure>
              </button>
            </div>
            <div className="project-item active">
              <iframe
                src="//www.youtube.com/embed/zg3qNVPQPYg?&rel=0&showinfo=0&autoplay=false&mute=false&loop=false&controls=1"
                title="Project gameplay video" frameBorder="0" allow="autoplay; encrypted-media" allowFullScreen></iframe>
            </div>





          </ul>

          <div className="title-wrapper">
            <div className="icon-box">
              <Icon name="book-outline"  />
            </div>

            <h3 className="h3">Mugen Horror</h3>
          </div>

          <ul className="timeline-list">
            <li className="timeline-item">
              <span>Jun/2023 — Nov/2023</span>
              <ul>
                <li>
                  <ul className="timeline-description-list">
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        This multi-genre game allows players to explore haunted locations, uncover their stories, and
                        defeat main ghosts. In each level, players begin by searching and solving puzzles to find the
                        key to the room where the main ghost resides. Upon entering that room, players engage in combat
                        mode with the ghost.
                      </p>
                      <p className="timeline-text description">
                        After defeating the boss, players receive items, clothes, and materials to
                        equip themselves or enhance their camera. These items and equipment can also be purchased in the
                        shop. The game features a blend of 3D third-person exploration, 2D puzzle-solving and searching,
                        and 3D first-person shooter combat.
                      </p>
                      <p className="timeline-text description">
                        It is available on the Mirrativ app, which allows players to
                        livestream their gameplay. Viewers can give gifts or gacha to players and chat with them. When
                        there are viewers, players receive a strength boost at the beginning of the game.
                      </p>
                    </li>
                    <li className="timeline-description">
                      <p className="timeline-text description">
                        Team composition includes a total of 18 individuals, with 8 working in the front-end team, 3 in
                        the back-end team, 1 in project owner, 1 is director, 4 in design , and 1 serving as a tester.
                      </p>
                    </li>
                    <li className="timeline-description"></li>
                  </ul>
                </li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Main responsibility:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Separated scenes (addition of a loading scene) with a scene loading system.
                  </p>
                  <p className="timeline-text description">
                    Implemented enemy stats with an already available game ability system.
                  </p>
                  <p className="timeline-text description">
                    Created new skills for enemies/bosses based on the game ability system.
                  </p>
                  <p className="timeline-text description">
                    Wrote unit tests for new skills.
                  </p>
                </li>
                <li className="timeline-description"></li>
              </ul>
            </li>

            <li className="timeline-item">
              <h1 className="h4 timeline-item-title">Achievements:</h1>
              <ul className="timeline-description-list">
                <li className="timeline-description">
                  <p className="timeline-text description">
                    Developed and implemented a scene loading system that significantly improved game flow and reduced
                    loading times, enhancing the overall player experience.
                  </p>
                  <p className="timeline-text description">
                    Successfully integrated enemy stats using the existing game ability system.
                  </p>
                  <p className="timeline-text description">
                    implemented new enemy and boss skills that leveraged the game ability system, enhancing game
                    complexity and strategy.
                  </p>
                  <p className="timeline-text description">
                    Developed comprehensive unit tests for the newly created skills, ensuring high code coverage and
                    reducing bugs, thereby increasing the overall stability and reliability of the game.
                  </p>
                  <p className="timeline-text description">
                    Released in late November 2022 and had been the most popular game on Mirrativ app for 3 months.
                  </p>
                </li>
              </ul>
            </li>
            <li className="timeline-item"></li>
          </ul>

          <section className="service">
            <h3 className="h3 service-title"></h3>

            <ul className="service-list">
              <a className="service-item"
                href="https://twitter.com/hashtag/%E3%82%80%E3%81%92%E3%81%9F%E3%82%93?src=hashtag_click">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-quote.svg" alt="Main Website" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Twitter Post</h4>
                </div>
              </a>
              <a className="service-item" href="https://www.youtube.com/watch?v=3E0u2mPp75U">
                <div className="service-icon-box">
                  <img src="/assets/images/icon-app.svg" alt="Demo" width="40" />
                </div>

                <div className="service-content-box">
                  <h4 className="h4 service-item-title">Watching Game</h4>
                </div>
              </a>
            </ul>

          </section>


    </section>
  ),
};

export default function ProjectDetails({ detailId, onOpenMedia }) {
  const Component = PROJECT_DETAILS[detailId];
  if (!Component) return null;
  return <Component onOpenMedia={onOpenMedia} />;
}
