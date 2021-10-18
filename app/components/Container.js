import React, {useEffect} from 'react';

const Container = (props) => {
  const _className = props.wide?'container py-md-5':'container container--narrow py-md-5'
  return (
    <div className={_className}>
      {props.children}
    </div>
  );
};

export default Container;