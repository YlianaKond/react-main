import React from 'react';
import Profil_content from '../components/profil_content';
import Profil_contwnt1 from '../components/profil_contwnt1';
import Lisha_info from '../components/lishna_info';
import Snanist from '../components/statist';

function ProfilePage() {
  return (
    <div className="profile-page">
      <section className="profile-header py-5 bg-primary text-white">
        <Profil_content />
      </section>
      
      <section className="profile-content py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-3">
              <Profil_contwnt1 />
              <Snanist />
            </div>
            <div className="col-lg-9">
              <Lisha_info />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ProfilePage;