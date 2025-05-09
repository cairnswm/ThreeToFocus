import React from 'react'

type ContainerProps = {
  fluid?: boolean
  children: React.ReactNode
}

const Container: React.FC<ContainerProps> = ({ fluid, children }) => {
  return <div className={'container flex flex-col w-full min-h-full bg-white'}>{children}</div>
}

export default Container
