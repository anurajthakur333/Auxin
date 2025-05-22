import Navbar from './components/Navbar'
import "./styles/fonts.css";

function App() {
  return (
    
    <div className="bg-black min-vh-100">
    <Navbar />

    <header className="container-fluid">
<div
  className="aeonik-font text-white"
  style={{
    fontSize: "10vw",      // Responsive large font size
    lineHeight: 1,
    width: "1000px",       // Match the SVG width
    height: "1000px",      // Match the SVG height
    display: "flex",
    alignItems: "left",
    justifyContent: "left",
    margin: "0px",      // Center horizontally
    overflow: "hidden",    // Prevent overflow
    whiteSpace: "nowrap"   // Prevent wrapping
  }}
>
  Auxin Media
</div>  
</header>


    <main className="container">
      <div className="row">
        <div className="col-12 text-center">
   
          <div style={{ maxWidth: '400px', margin: '20px auto' }}>
            <div 
              className="tenor-gif-embed" 
              data-postid="17569464" 
              data-share-method="host" 
              data-aspect-ratio="1.02894" 
              data-width="100%"
            >
              <a href="https://tenor.com/view/modiji-bhangra-dance-happy-celebrate-gif-17569464">
                Modiji Bhangra GIF
              </a>
              from 
              <a href="https://tenor.com/search/modiji-gifs">Modiji GIFs</a>
            </div>
          </div>
  
          <script type="text/javascript" async src="https://tenor.com/embed.js"></script>



          <section style={{ background: "#181818", borderRadius: 12, padding: 24, marginTop: 40 }}>
        <h2 className="text-white mb-4">Font Preview</h2>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <div className="aeonik-light text-white" style={{ fontSize: 28 }}>
              Aeonik Light: Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789
            </div>
          </div>
          <div>
            <div className="aeonik-regular text-white" style={{ fontSize: 28 }}>
              Aeonik Regular: Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789
            </div>
          </div>
          <div>
            <div className="aeonik-bold text-white" style={{ fontSize: 28 }}>
              Aeonik Bold: Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789
            </div>
          </div>
          <div>
            <div className="aeonik-light-italic text-white" style={{ fontSize: 28 }}>
              Aeonik Light Italic: Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789
            </div>
          </div>
          <div>
            <div className="aeonik-italic text-white" style={{ fontSize: 28 }}>
              Aeonik Italic: Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789
            </div>
          </div>
          <div>
            <div className="aeonik-bold-italic text-white" style={{ fontSize: 28 }}>
              Aeonik Bold Italic: Aa Bb Cc Dd Ee Ff Gg Hh Ii Jj Kk Ll Mm Nn Oo Pp Qq Rr Ss Tt Uu Vv Ww Xx Yy Zz 0123456789
            </div>
          </div>
          <div>
            <div className="auxin-numbers text-white" style={{ fontSize: 32, letterSpacing: 2 }}>
              AuxinNumbers: 0123456789
            </div>
          </div>
        </div>
      </section>









        </div>
      </div>
    </main>
  </div>
  
  )
}

export default App
