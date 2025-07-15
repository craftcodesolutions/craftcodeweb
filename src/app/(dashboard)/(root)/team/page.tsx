import React from 'react'
import TeamPage from './_components/TeamPage';
import TeamTimeline from './_components/TeamTimeline';
import ValueCarousel from './_components/ValueCarousel';

const Team = () => {
  return (
    <div>
      <TeamPage/>
      <TeamTimeline/>
      <ValueCarousel/>
    </div>
  )
}

export default Team;
