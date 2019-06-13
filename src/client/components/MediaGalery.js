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

  const list = state.media.map(item => <div key={item}>{item}</div>);

  return <div>{list}</div>;
}
