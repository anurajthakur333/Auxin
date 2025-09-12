import '../styles/fonts.css';
import '../styles/Main.css';

const Meeting = () => {
  return (
    <div className="container-fluid" style={{ paddingTop: '100px', minHeight: '100vh' }}>
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-12">
          <div className="text-center">
            <h1 className="green-text aeonik-regular mb-4" style={{ fontSize: '3rem' }}>
              Schedule a Meeting
            </h1>
            <p className="text-white aeonik-regular mb-5" style={{ fontSize: '1.2rem' }}>
              Let's discuss your project and how we can help bring your vision to life.
            </p>
            
            <div className="d-flex flex-column flex-md-row justify-content-center gap-4">
              <a 
                href="mailto:auxinmedia@gmail.com" 
                className="btn btn-outline-light btn-lg aeonik-regular"
                style={{ 
                  padding: '15px 30px',
                  borderColor: '#39FF14',
                  color: '#39FF14',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#39FF14';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#39FF14';
                }}
              >
                Email Us
              </a>
              
              <a 
                href="tel:+1234567890" 
                className="btn btn-outline-light btn-lg aeonik-regular"
                style={{ 
                  padding: '15px 30px',
                  borderColor: '#39FF14',
                  color: '#39FF14',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#39FF14';
                  e.currentTarget.style.color = '#000';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#39FF14';
                }}
              >
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Meeting;
