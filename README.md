# Naivechain - 블록체인 실행 200줄 코드

### 개발 동기
모든 현재 구현된 블록체인들은 그것의 개발자들이 (ex: 비트코인, 이더리움) 해결하려고 하는 상황과 문제점들과 밀접하게 연관이 되어있습니다.
이것은 블록체인을 이해하는데 있어서 필연적으로 어려운 요소로 작용하게 됩니다. 특히 소스코드는 더욱 그러합니다. 그래서 이 프로젝트는 가능한 한 블록체인을 간결하고 간단하게 구현하기 위해 시작되었습니다.
 
### 블록체인은 무엇인가?
[From Wikipedia](https://ko.wikipedia.org/wiki/%EB%B8%94%EB%A1%9D%EC%B2%B4%EC%9D%B8) : 관리 대상 데이터를 '블록'이라고 하는 소규모 데이터들이 P2P 방식을 기반으로 생성된 체인 형태의 연결고리 기반 분산 데이터 저장환경에 저장되어 누구도 임의로 수정될 수 없고 누구나 변경의 결과를 열람할 수 있는 분산 컴퓨팅 기술 기반의 데이터 위변조 방지 기술입니다.

### Naivechain의 주요개념!
핵심적인 개념에대한 자세한 정보는 [이 블로그 게시물](https://medium.com/@lhartikk/a-blockchain-in-200-lines-of-code-963cc1cc0e54#.dttbm9afr5)을 확인해주세요.
* 노드를 제어하는 HTTP 인터페이스
* 웹 소켓을 통해 다른 노드들과 통신(P2P) 
* 매우매우매우매우 슈퍼 울트라 간단한 P2P 통신 프로토콜
* 노드의 데이터가 유지 되지 않음
* 작업증명(Proof-of-Work) 혹은 지분증명(Proof-of-Stake)을 사용하지 않음 : 블록을 경쟁없이 블록에 추가할 수 있음

![alt tag](naivechain_blockchain.png)

![alt tag](naivechain_components.png)


### Naivecoin
블록체인에 대한 광범위한 자습서를 보시고 싶으면 이 프로젝트를 살펴보세요 [Naivecoin](https://lhartikk.github.io/). 이 코인은 네이브체인을 기반으로하며, 작업증명(Proof-of-Work), 트렌젝션 처리 및 지갑을 구현합니다.

### 빠른 시작
(2개의 연결된 노드와 블록 1개를 생성)
```
npm install
HTTP_PORT=3001 P2P_PORT=6001 npm start
HTTP_PORT=3002 P2P_PORT=6002 PEERS=ws://localhost:6001 npm start
curl -H "Content-type:application/json" --data '{"data" : "Some data to the first block"}' http://localhost:3001/mineBlock
```

### 도커를 이용하여 빠른 시작
(3개의 연결된 노드와 블록 1개를 생성)
###
```sh
docker-compose up
curl -H "Content-type:application/json" --data '{"data" : "Some data to the first block"}' http://localhost:3001/mineBlock
```

### HTTP API
##### 블록 가져오기
```
curl http://localhost:3001/blocks
```
##### 새 블록을 생성
```
curl -H "Content-type:application/json" --data '{"data" : "Some data to the first block"}' http://localhost:3001/mineBlock
``` 
##### 피어 추가
```
curl -H "Content-type:application/json" --data '{"peer" : "ws://localhost:6001"}' http://localhost:3001/addPeer
```
#### 연결된 피어들에 대한 쿼리
```
curl http://localhost:3001/peers
```
