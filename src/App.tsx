import Navbar from './components/Navbar'
import "./styles/fonts.css";
import "./styles/Main.css";
import ScrambleText from "./components/ScrambleText";
function App() {
  return (
    
<div className="bg-black min-vh-100">
    <Navbar />


    <div className="container-fluid">
  <div className="d-flex justify-content-between align-items-start">
    {/* Logo */}
    <img src="auxin.svg" alt="Auxin Logo" width="85" height="35" className="mt-3"/>

    {/* Heading */}
<ScrambleText
  as="h1"
  className="text-white text-end aeonik-light me-2"
  style={{
    fontSize: "78.45px",
    letterSpacing: "-3px",
    lineHeight: "70px",
    fontWeight: 300,
  }}
  duration={3000}
  frameInterval={60} // 60fps for smoothness
  letters={"abcdbcdefghijklmnopqrstuvwxyz0123456789@#$%&*"}
  scrambleColorClass="green"
  easing={(t) => -(Math.cos(Math.PI * t) - 1) / 2} // sine easeInOut
  trigger="load"
>
  Adapting your business<br />
  with AI <span className="green-text">power</span> - Like<br />
  never before
</ScrambleText>


  </div>
</div>


<div className="position-absolute bottom-0 start-0 ms-3 aeonik-light fw-light" style={{paddingBottom:"70px",fontWeight:"300"}}>
  <p className="text-white m-0" style={{ fontSize: '48.49px', letterSpacing: '-2px', lineHeight: '50px' }}>
    Crafted with <span className="green-text">INTENT.</span><br />
    Optimized with <span className="green-text">PURPOSE.</span>
  </p>
</div>







{/* <header className="container-fluid p-0 m-0">
  <div className="aeonik-font text-white" style={{ fontSize: "20vw", lineHeight: 0.72, letterSpacing: "-0.05em"}}>
    Auxin Media
  </div>
</header> */}
{/* <ScrambleText text="Hover Over Me!"/> */}

    <main className="container">
      <div className="row">
        <div className="col-12 text-center">
   
          {/* <div style={{ maxWidth: '400px', margin: '20px auto' }}>
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
          </div> */}
  
          {/* <script type="text/javascript" async src="https://tenor.com/embed.js"></script>



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
      </section> */}



{/* <div className="text-white">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Tenetur sequi iure aperiam maiores accusantium magnam quae impedit autem, atque, molestiae, aliquam eligendi laudantium ducimus est suscipit dignissimos. Vel voluptate aspernatur fuga sit aliquid enim laborum consequuntur architecto nobis, nihil quis molestiae doloribus quas facilis debitis dignissimos earum recusandae eveniet omnis nulla error. Alias quos esse ut unde consectetur. Hic a dolor, placeat illum quod quo earum temporibus exercitationem ipsam voluptates eveniet optio veniam minima in aliquid suscipit, blanditiis pariatur porro ut impedit doloribus dolores culpa! Corporis alias autem laboriosam, dolores nulla doloremque labore ipsum fugiat animi nobis. Inventore omnis quo ut a error voluptas quasi facilis doloremque architecto aspernatur iure eum unde, quod accusantium? Commodi numquam, inventore qui quaerat asperiores nostrum nihil sunt, dolor officia distinctio cumque repellat libero. Laborum sunt officia asperiores neque ipsa. Ipsum quo, voluptas dolorem error id quam incidunt nisi fugit eius minima saepe recusandae repudiandae autem obcaecati quasi, expedita facilis possimus voluptates. Sed commodi inventore, iusto quos excepturi unde quae animi sint aliquam nam repellendus dolorem aliquid ducimus voluptatem at corporis rem fugit accusamus deserunt aspernatur consequuntur libero sunt. Ea sint nostrum amet optio aliquid, quod voluptatem, ut at eveniet tempore quidem molestias quis perspiciatis molestiae qui? Enim velit magnam maiores rerum error similique nulla nam veniam cupiditate. Quo facere ducimus sit? Assumenda enim, nobis atque delectus optio dolor illo aperiam quaerat saepe vero eligendi magnam repudiandae fuga tenetur earum iusto dignissimos nisi cupiditate blanditiis alias? Tempore illo fuga ipsam fugit. Totam quos delectus cumque omnis, officia deleniti. Sapiente atque vitae aut eaque. Nesciunt excepturi aliquam dicta tempore quas nihil a, voluptatibus, molestiae animi, labore natus quae exercitationem architecto. Incidunt dolore illum laborum deserunt libero ullam repudiandae qui recusandae. Voluptatem id dolore, quidem in delectus velit aperiam molestiae, necessitatibus, perspiciatis perferendis rem. Aut explicabo dolorum quasi fuga laudantium esse ab mollitia, doloremque corrupti libero neque. Temporibus voluptatum fugit velit rem dolorum adipisci voluptates. Quam iure numquam aliquam ab sapiente obcaecati similique sint sunt animi! Autem error quidem voluptatum quaerat neque incidunt nesciunt illo deleniti eligendi praesentium dignissimos consectetur quam sequi molestiae in laboriosam possimus corrupti, adipisci consequatur mollitia itaque. Enim cumque esse animi, eius nobis molestias iure tenetur, praesentium deserunt magnam aperiam. Iure esse nulla veritatis pariatur repellendus! Eveniet tenetur ipsa quam sed cumque, repellat, iure ipsum mollitia, dolore repellendus fugit fugiat nulla enim magnam sint magni? Itaque ipsam sapiente quibusdam rem illo cupiditate quas asperiores magni, fuga ipsum, perferendis magnam earum reprehenderit illum libero accusantium consequatur enim odio aliquam animi, minus dolor? Deleniti officiis velit quo modi aliquid doloribus ipsam pariatur. Voluptates, quaerat? Labore minus, odio molestias pariatur tempore debitis alias. Cum, possimus nesciunt quibusdam ullam earum repellat sapiente iure assumenda tenetur iste, laboriosam, provident laudantium culpa! Aliquam, ut. Iste architecto obcaecati impedit perferendis nihil iusto excepturi voluptate eum consectetur voluptatem! Quidem accusamus itaque a recusandae illo ab voluptas. Modi exercitationem sit nulla nemo molestiae, magnam distinctio rem deserunt! Nemo, asperiores recusandae. Atque exercitationem consequuntur dolore quidem ea reiciendis delectus obcaecati, qui nulla tempora debitis! Earum dolores odio impedit commodi unde harum in libero natus ullam rem! Officia quia qui soluta possimus obcaecati eaque nam, vitae libero accusantium eveniet voluptatum neque. Placeat natus quia officia dolores dolorum obcaecati dicta aliquam sapiente. Eius, vel totam error deserunt voluptate excepturi consectetur quibusdam voluptates, iure corrupti labore eaque! Odit, quam totam. Reiciendis veniam consectetur autem culpa id perferendis quis at accusantium ipsam tempore? Odit, porro facere fugiat impedit reprehenderit eaque eligendi, recusandae natus ipsa ex quis ipsam non! In temporibus reprehenderit minima error? Enim inventore quibusdam ipsum? Asperiores architecto laudantium fugit itaque blanditiis dolore vitae accusamus cumque deserunt? Dolores dolorem dicta vel illo ullam necessitatibus assumenda esse ipsa iure reiciendis, nemo laboriosam deserunt alias culpa. Vel numquam dignissimos cupiditate, repellat minus nostrum consequuntur maiores nemo quam facilis eligendi inventore ut quisquam molestiae! Nemo eaque obcaecati saepe blanditiis incidunt accusamus tenetur optio debitis consequuntur tempora voluptatum consectetur non facilis modi, similique aut laudantium doloremque nobis esse, nisi sapiente dignissimos, ea quos? Dolor labore quo architecto ducimus, explicabo aperiam iusto! Nobis sint magni tenetur repellendus quisquam dolores autem at maiores quis nostrum doloremque eos corrupti iusto animi officiis deserunt provident eveniet dicta fuga nihil quam, veritatis aperiam temporibus molestiae? Facere, velit cumque? Natus, voluptas, hic a optio quam, vel consequuntur cum praesentium iste provident deleniti! Placeat officia dicta nesciunt et! Architecto corporis minima officia adipisci repellendus beatae, aliquid illo eius mollitia fugit labore voluptates quas reiciendis laudantium, iste voluptate nemo animi at odit facilis sint quaerat. Quod quae quasi quisquam hic suscipit libero nesciunt ratione, quibusdam cumque accusantium, eos ipsam nostrum neque aperiam non repellendus recusandae qui. Perspiciatis rerum quam facilis ipsam, fugiat doloremque nihil officiis, odit voluptates cum sequi, necessitatibus eaque! Numquam exercitationem, at fugiat ad eum ratione cumque et, porro incidunt atque ducimus est voluptatibus non tempora aliquam cupiditate adipisci eligendi similique! Voluptatum quam explicabo repellat debitis voluptates minima saepe a. Mollitia assumenda minus animi aspernatur molestias quam dignissimos quis, explicabo qui voluptas magnam tenetur atque voluptatibus aut sint earum? Quam, nisi vero quod unde enim ab esse officia nostrum dicta necessitatibus quos adipisci repellat accusantium error nesciunt ex fugit ipsa natus voluptate eaque. Repellat pariatur odio velit aliquam tempore, iste quisquam. Dolorem odio enim provident cum. Tenetur, velit rem. Debitis expedita similique ut fugit distinctio vitae esse rem nobis eius, excepturi provident voluptatum porro veniam reprehenderit eligendi, dolorem dolorum corrupti obcaecati nemo nostrum nam repellendus? Quis, doloremque. Aliquam quam quia eligendi, ullam atque neque officia nam obcaecati vitae vel numquam, ut fuga iure! Sapiente dolorum minima corporis distinctio fugiat necessitatibus iusto repudiandae qui nihil dignissimos dicta voluptatem temporibus cum aliquam accusamus ea perferendis quia, doloribus voluptatum tempora dolores a mollitia. A, reiciendis blanditiis? Nulla deserunt incidunt dicta id natus vero labore dolorum nobis, recusandae provident debitis ullam officiis perspiciatis velit repudiandae voluptatibus in fuga excepturi cum, consequuntur expedita perferendis doloremque sed fugit. Quas, dolorum illo impedit illum similique quis sit minima dolores inventore reiciendis libero facere hic corrupti eos nihil rerum, expedita laborum, omnis fuga! Voluptates?
</div> */}





        </div>
      </div>
    </main>
  </div>
  
  )
}

export default App
