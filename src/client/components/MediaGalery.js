import React, { useState, useEffect } from 'react';
import PubSub from 'pubsub-js';
import axios from '../utils/axios';
import { pubSub as ps } from '../utils/const';

export default function MediaGalery() {
  const [state, setState] = useState({ media: [] });
  const [needRefresh, setNeedRefresh] = useState(true);

  useEffect(() => {
    const loadMedia = async () => {
      const result = await axios.get('/videos');
      setState(result.data);
      setNeedRefresh(false);
    };
    if (needRefresh) {
      loadMedia();
    }
  }, [needRefresh]);

  useEffect(() => {
    const token = PubSub.subscribe(ps.topics.MEDIA_LIST, (msg, data) => {
      if (data === ps.events.REFRESH) {
        setNeedRefresh(true);
      }
    });
    return () => {
      PubSub.unsubscribe(token);
    };
  });

  const list = state.media.map(item => (
    <div key={item}>
      <a href={`/api/videos/${item}`}>
        <img src={`/${item}.jpg`} alt={item} width="200" height="200" />
      </a>
    </div>
  ));

  return <div>{list}</div>;
}
