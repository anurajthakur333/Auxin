import Navbar from './components/Navbar'

function App() {
  return (
    <div className="bg-black min-vh-100">
    <Navbar />
    <main className="container py-5 mt-5">
      <div className="row">
        <div className="col-12 text-center">
          <h1 className="display-4 fw-bold text-white">Welcome to Auxin</h1>
          
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
        </div>
      </div>
    </main>
  </div>
  
  )
}

export default App
