import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';

export default function MediaGalery() {
  const [state, setState] = useState({ media: [] });

  useEffect(() => {
    const loadMedia = async () => {
      const result = await axios.get('/videos');
      setState(result.data);
    };
    loadMedia();
  }, []);

  const list = state.media.map(item => (
    <div key={item}>
      <a href={`/api/videos/${item}`}>
        <img src={`/${item}.jpg`} alt={item} width="200" height="200" />
      </a>
    </div>
  ));

  return <div>{list}</div>;
}
