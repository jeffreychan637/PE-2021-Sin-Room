
const loadMoreButton = document.querySelector('[data-comment="load-more-btn"]')
const commentContainer = document.querySelector('[data-comment="container"]')

let currentPost = 0

const loadMore = async () => {
    try {
        currentPost++
        const data = await fetch(
            `https://jsonplaceholder.typicode.com/posts/${currentPost}/comments`
        )
        const commentsResponse = await data.json();
        console.log(commentsResponse);


        const comments = [...document.querySelectorAll('[data-comment="comment"]')]

        for (let comment of commentsResponse) {

            const newComment = comments[0].cloneNode(true)

            const commentValueElem = newComment.querySelector('[data-comment="comment-text"]')
            const commenterElem = newComment.querySelector('[data-comment="commenter"]')

            commentValueElem.innerText = `${comment.body}`
            commenterElem.innerText = `${comment.email}`

            commentContainer.appendChild(newComment)
        }
        
    } catch (err) {
        console.error(`Error getting todo: ${err}`)
    }
}

loadMoreButton.addEventListener('click', loadMore);



// //const clearTodosButton = document.querySelector('[data-todo="clear-todos"]')
// //const empty = document.querySelector('[data-todo="empty"]')
// const todo = document.querySelector('[data-todo="todo"]')
// const todosParent = todo.parentNode

// let currentTodo = 0

// const addTodo = async () => {
// try {
//     currentTodo++
//     const data = await fetch(
//     `https://jsonplaceholder.typicode.com/todos/${currentTodo}`
//     )
//     const json = await data.json();
//     console.log(json);

//     const todos = [...document.querySelectorAll('[data-todo="todo"]')]
//     const newTodo = currentTodo === 1 ? todos[0] : todos[0].cloneNode(true)

//     const title = newTodo.querySelector('[data-todo="title"]')
//     const id = newTodo.querySelector('[data-todo="id"]')

//     title.innerText = `Title: ${json.title}`
//     id.innerText = `ID: ${json.id}`

//     if (currentTodo > 1) {
//     todosParent.appendChild(newTodo)
//     }
//     newTodo.style.display = 'flex'

//     const removeButton = newTodo.querySelector('[data-todo="remove"]')
//     removeButton.addEventListener('click', () => {
//     const todos = [...document.querySelectorAll('[data-todo="todo"]')]
//     if (todos.length === 1) {
//         currentTodo = 0
//         newTodo.style.display = 'none'
//     } else {
//         newTodo.parentNode.removeChild(newTodo)
//     }
//     })
// } catch (err) {
//     console.error(`Error getting todo: ${err}`)
// }
// }

// addTodoButton.addEventListener('click', addTodo)

// const clearTodos = () => {
// currentTodo = 0
// const todos = [...document.querySelectorAll('[data-todo="todo"]')]
// todos.forEach((todo, index) => {
//     if (index === 0) {
//     todo.style.display = 'none'
//     } else {
//     todo.parentNode.removeChild(todo)
//     }
// })
// }

// clearTodosButton.addEventListener('click', clearTodos);