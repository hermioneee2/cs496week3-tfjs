# 토마토마토

![Untitled](%E1%84%90%E1%85%A9%E1%84%86%E1%85%A1%E1%84%90%E1%85%A9%E1%84%86%E1%85%A1%E1%84%90%E1%85%A9%20e2f607aa33154c4a9435281e2ad5ef3c/Untitled.png)

“토마토마토”는 카메라 모션인식을 이용하여 컴퓨터 화면에 흩뿌려진 토마토를 수확하는 게임입니다. 상한 노란색 토마토는 칼로 처치하지 않으면 터지고, 터진 토마토가 3개 모이면 게임 오버. 오른손으로는 휴대폰을 들고 컴퓨터 앞에서 이리 저리 움직이며 토마토를 최대한 빠른 시간 안에 수확해보세요!

## 게임 설명

- 오른손으로 핸드폰을 쥐고 컴퓨터 화면상의 토마토를 수확하는 게임입니다.
- 장갑 아이콘이 떠있는 오른손으로 토마토를 건드리면, 컴퓨터 화면 위의 토마토가 내 핸드폰안에 담깁니다. 빨간 토마토와 상한 토마토 모두 수확이 가능합니다.
- 핸드폰을 너무 많이 기울이거나 흔들면 수확한 토마토가 떨어집니다. (상한 토마토를 담았을 경우, 일부러 떨어뜨리고 싶을 수도 있죠!)
- 상한 토마토는 7초 이내로 칼로 제거하거나 수확하지 않으면 터져버립니다.
- 토마토가 3개 터지면 게임이 끝납니다.
- 토마토를 20개 수확하면 게임이 끝납니다.

## 개발 환경

- OS: Android (26 or Later)
- Web: HTML, CSS, Javascript
- App: Kotlin / JavaScript
- DB: MySQL
- Sever: node.js
- IDE: Android Studio / Visual Studio Code

### 기능 설명

### **게임 시작 전**

- 웹에서 4자리 숫자로 이루어진 코드가 생성이 됩니다.
- 앱에서 해당 코드를 입력하면 게임을 시작할 수 있습니다.
- 앱에서 입력한 코드가 올바른 경우, 웹에 시작 버튼이 생성됩니다.
- 시작버튼을 누르기 전까지 앱은 대기화면을 표시하는데, 이때 클릭을 하면 모바일 기기의 움직임에 따라 흔들리는 토마토들을 즐길 수 있습니다.
- 웹에서 시작 버튼을 누르면 게임이 시작됩니다.

### **게임 시작 후**

- 웹에서는 tensorflow의 pose estimation 모델을 연동하여 움직이는 사람의 손목 위치를 포착합니다.
- 게임 참가자가 손목을 잠깐 동안 팝업되는 토마토 이미지에 가져다대면 해당 이벤트는 실시간으로 앱에 반영됩니다.
- 오른손과 왼손 모션을 따로 감지하여 게임 룰에 맞는 액션이 적용됩니다.
    - 예1: 오른손으로 빨간 토마토를 건드릴 경우 빨간 토마토가 앱에 들어갑니다.
    - 예2: 오른손으로 상한 토마토를 건드릴 경우 상한 토마토가 앱에 들어가고 카운트 다운이 재개됩니다.
    - 예3: 왼손으로 빨간 토마토를 건드릴 경우 빨간 토마토가 사라집니다.
    - 예4: 왼손으로 상한 토마토를 건드릴 경우 상한 토마토가 사라지고 카운트 다운이 재개됩니다.
- 웹에서 상한 토마토를 제한 시간 내 건드리지 않는 경우 경고 화면이 재생됩니ㅏㄷ.
- 앱에는 가속도 센서를 활용하여 모바일 기기의 기울임, 흔들림을 감지합니다.
- 앱에서 기기가 흔들림을 감지하면 수확된 토마토의 개수가 차감됩니다.
- 앱에서는 토마토가 수확되거나 흔들림이 감지되면 효과음을 재생합니다.

### **게임이 끝난 후**

- 앱에서는 현재 수확한 토마토의 개수와 걸린 시간을 확인 할 수 있습니다.
- 웹에서는 다시 시작 버튼을 통해 게임을 다시 시작할 수 있습니다.

### DB: MySQL

- 현재 토마토 개수, 들어간 토마토의 상태 등과 4자리 코드 등을 DB에 저장합니다.
- 데이터베이스 game_info
    - socketid
        
        ![Untitled](%E1%84%90%E1%85%A9%E1%84%86%E1%85%A1%E1%84%90%E1%85%A9%E1%84%86%E1%85%A1%E1%84%90%E1%85%A9%20e2f607aa33154c4a9435281e2ad5ef3c/Untitled%201.png)
        
    - tomato
        
        ![Untitled](%E1%84%90%E1%85%A9%E1%84%86%E1%85%A1%E1%84%90%E1%85%A9%E1%84%86%E1%85%A1%E1%84%90%E1%85%A9%20e2f607aa33154c4a9435281e2ad5ef3c/Untitled%202.png)
        
        - toma(int): 토마토 번호
        - sort(int): 토마토 종류

### Server: NodeJS, Express, Socket.io

- **Authors**

이혜림(카이스트 18): [https://github.com/hermioneee2](https://github.com/hermioneee2)

우다연(성균관대 19): [https://github.com/yeonyeonn](https://github.com/yeonyeonn)
