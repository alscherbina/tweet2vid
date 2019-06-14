import React, { useState } from 'react';
import axios from '../utils/axios';

export default function TaskSubmission() {
  const [taskUrl, setTaskUrl] = useState('');
  const [isSubmitting, setSubmitting] = useState(false);

  const onTaskInputChange = e => {
    setTaskUrl(e.target.value);
  };

  const submitTask = async () => {
    setSubmitting(true);
    await axios.post('/videos/task', { twitterPostURL: taskUrl });
    setSubmitting(false);
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
