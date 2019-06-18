import React, { useState, useEffect } from 'react';
import PubSub from 'pubsub-js';
import axios from '../utils/axios';
import { pubSub as ps } from '../utils/const';

export default function TaskSubmission() {
  const [taskUrl, setTaskUrl] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  const onTaskInputChange = e => {
    setTaskUrl(e.target.value);
  };

  const submitTask = async () => {
    setSubmitting(true);
    try {
      await axios.post('/videos/task', { twitterPostURL: taskUrl });
    } catch (e) {
      console.log(e);
    }
    setSubmitting(false);
    PubSub.publish(ps.topics.MEDIA_LIST, ps.events.REFRESH);
  };

  return (
    <div>
      <form>
        <input name="url" type="text" value={taskUrl} onChange={onTaskInputChange} />
        <button type="button" value="Load" onClick={submitTask} disabled={isSubmitting}>
          Load video
        </button>
      </form>
    </div>
  );
}
