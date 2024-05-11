import React from 'react'
import { Row, Col } from 'reactstrap'
import SkeltonWrapper from '../../Elements/Skelton/SkeltonWrapper'

const PriorArtSkelton = () => {
  return (
    <Row className="each-priorart-patent">
    <Col className="prior-art-tiles-skelton prior-art-tiles-skelton-novelty" lg={12} >
    <SkeltonWrapper
        padding={"0px 5px"}
        background={"transparent"}
        skeltonHeight={'100%'}
        height = {'100%'}
      />
    </Col>
    <Col className="prior-art-tiles-skelton" lg={7}>
      <SkeltonWrapper
        padding={"0px 5px"}
        background={"transparent"}
        skeltonHeight={"100%"}
        height = {'100%'}
      />
    </Col>
    <Col className="prior-art-tiles-skelton" lg={5}>
      <SkeltonWrapper
        padding={"0px 5px"}
        background={"transparent"}
        skeltonHeight={"100%"}
        height = {'100%'}
      />
    </Col>
    <Col className="prior-art-tiles-skelton" lg={7}>
      <SkeltonWrapper
        padding={"0px 5px"}
        background={"transparent"}
        skeltonHeight={"100%"}
        height = {'100%'}
      />
    </Col>
    <Col className="prior-art-tiles-skelton" lg={5}>
      <SkeltonWrapper
        padding={"0px 5px"}
        background={"transparent"}
        skeltonHeight={"100%"}
        height = {'100%'}
      />
    </Col>
    <Col className="prior-art-tiles-skelton" lg={7}>
      <SkeltonWrapper
        padding={"0px 5px"}
        background={"transparent"}
        skeltonHeight={"100%"}
        height = {'100%'}
      />
    </Col>
    <Col className="prior-art-tiles-skelton" lg={5}>
      <SkeltonWrapper
        padding={"0px 5px"}
        background={"transparent"}
        skeltonHeight={"100%"}
        height = {'100%'}
      />
    </Col>
    <Col className="prior-art-tiles-skelton" lg={7}>
      <SkeltonWrapper
        padding={"0px 5px"}
        background={"transparent"}
        skeltonHeight={"100%"}
        height = {'100%'}
      />
    </Col>
    <Col className="prior-art-tiles-skelton" lg={5}>
      <SkeltonWrapper
        padding={"0px 5px"}
        background={"transparent"}
        skeltonHeight={"100%"}
        height = {'100%'}
      />
    </Col>
  </Row>
  )
}

export default PriorArtSkelton