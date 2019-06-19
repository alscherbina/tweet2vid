import React, { useState, useEffect } from 'react';
import PubSub from 'pubsub-js';
import axios from '../utils/axios';
import { pubSub as ps } from '../utils/const';

export default function MediaGalery({ columnsNumber = 4 }) {
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

  const partitionedMediaList = state.media.reduce((res, item, idx) => {
    const bucket = Math.floor(idx / columnsNumber);
    if (!res[bucket]) {
      res[bucket] = [];
    }
    res[bucket].push(item);
    return res;
  }, []);

  const columnWidthClass = `is-${Math.ceil(12 / columnsNumber)}`;

  const tilesList = partitionedMediaList.map(item => {
    const key = item.reduce((res, mediaId) => {
      return res + mediaId;
    }, '');
    const rowItems = item.map(mediaId => (
      <div key={mediaId} className={`column ${columnWidthClass}`}>
        <div className="box">
          <a href={`/${mediaId}.mp4`}>
            <figure className="image is-1by1">
              <img src={`/${mediaId}.jpg`} alt={mediaId} />
            </figure>
          </a>
        </div>
      </div>
    ));
    return (
      <div key={key} className="columns">
        {rowItems}
      </div>
    );
  });
  return <div className="container">{tilesList}</div>;
}
