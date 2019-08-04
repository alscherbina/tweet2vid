import React, { useState, useEffect } from 'react';
import PubSub from 'pubsub-js';
import axios from '../utils/axios';
import { pubSub as psConst } from '../utils/const';
import MediaGalleryItem from './MediaGalleryItem';

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
    const token = PubSub.subscribe(psConst.topics.MEDIA_LIST, (msg, data) => {
      if (data === psConst.events.REFRESH) {
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

  const columnWidth = Math.ceil(12 / columnsNumber);

  const tilesList = partitionedMediaList.map(item => {
    const key = item.reduce((res, mediaId) => {
      return res + mediaId;
    }, '');
    const rowItems = item.map(mediaId => (
      <MediaGalleryItem key={mediaId} mediaId={mediaId} columnWidth={columnWidth} />
    ));
    return (
      <div key={key} className="columns">
        {rowItems}
      </div>
    );
  });
  return <div className="container">{tilesList}</div>;
}
